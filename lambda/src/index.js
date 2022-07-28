const AWS = require('aws-sdk')

const api = new AWS.ApiGatewayManagementApi({
    endpoint: 's8sc0oaqbh.execute-api.ap-northeast-2.amazonaws.com/prod'
})

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = async (event) => {
    const route = event.requestContext.routeKey
    const connectionId = event.requestContext.connectionId
    switch (route) {
        case '$connect':
            break
        case '$disconnect':
            await handleDisconnect(connectionId)
            break
        case '$default':
            await handleMessageData(JSON.parse(event.body), connectionId)
            break
        default:
            console.log('[handler]', 'Received unknown route:', route)
    }
    return {statusCode: 200}
}

async function handleDisconnect(connectionId) {
    const result = await ddb.scan({
        TableName: 'rtc-connection',
        FilterExpression: 'connectionId = :connectionId',
        ExpressionAttributeValues: {":connectionId": {S: connectionId}},
    }, handleAwsOutput).promise();

    for (const row of result.Items) {
        await ddb.deleteItem({
            TableName: 'rtc-connection',
            Key: {
                roomNumber: {N: row.roomNumber.N},
                connectionId: {S: connectionId}
            }
        }, handleAwsOutput).promise();
    }
}

async function handleMessageData(message, connectionId) {
    console.log('handleMessageData', message)
    switch (message.type) {
        case 'SIGN_IN':
            return await signIn(message, connectionId);
        case 'CREATE_ROOM':
            return await createRoom(message, connectionId);
        case 'GET_ROOMS':
            return await getRooms(message, connectionId);
        case 'JOIN_ROOM':
            return await joinRoom(message, connectionId);
        case 'CREATE_OFFER':
            return await createOffer(message, connectionId);
        case 'CREATE_ANSWER':
            return await createAnswer(message, connectionId);
        case 'CANDIDATE':
            return await candidate(message, connectionId);
        default:
            await pushMessage(connectionId, message.type, {error: 'unknown data type'});
    }
}

async function signIn({type, data}, connectionId) {
    const id = Math.floor(Math.random() * 100000)
    await ddb.putItem({
        TableName: 'user',
        Item: {
            id: {N: `${id}`},
            connectionId: {S: connectionId},
            name: {S: data.name},
        }
    }).promise()
    await pushMessage(connectionId, type, {id: id, connectionId: connectionId})
}

async function createRoom({type, data}, connectionId) {
    const roomNumber = `${Math.floor(Math.random() * 100000)}`

    await ddb.putItem({
        TableName: 'room',
        Item: {
            roomNumber: {N: roomNumber},
            title: {S: data.title}
        }
    }).promise()

    await ddb.putItem({
        TableName: 'rtc-connection',
        Item: {
            connectionId: {S: connectionId},
            roomNumber: {N: roomNumber}
        }
    }).promise()

    await pushMessage(connectionId, type, {roomNumber: roomNumber})
}

async function getRooms({type, data}, connectionId) {
    const result = await ddb.scan({TableName: 'room'}, handleAwsOutput).promise();
    await pushMessage(connectionId, type, {
            rooms: result.Items.map(row => ({
                roomNumber: row.roomNumber.N,
                title: row.title.S,
                member: 0
            }))
        }
    )
}

async function joinRoom({type, data, uid}, connectionId) {
    const result = await ddb.scan({
        TableName: 'rtc-connection',
        FilterExpression: 'roomNumber = :joinRoomNumber',
        ExpressionAttributeValues: {":joinRoomNumber": {N: data.roomNumber}},
    }, handleAwsOutput).promise();

    for (const row of result.Items) {
        if (row.connectionId.S !== connectionId) {
            await pushMessage(
                row.connectionId.S,
                'INIT_CONNECTION',
                {id: connectionId},
            ).catch(e => console.log('INIT_CONNECTION_FAIL', e, row.connectionId));
        }
    }

    await ddb.updateItem({
        TableName: 'user',
        Key: {"id": {N: `${uid}`}, "connectionId": {S: connectionId}},
        UpdateExpression: "SET currentRoomNumber = :currentRoomNumber",
        ExpressionAttributeValues: {":currentRoomNumber": {N: data.roomNumber}},
    }).promise();

    await ddb.putItem({
        TableName: 'rtc-connection',
        Item: {
            connectionId: {S: connectionId},
            roomNumber: {N: data.roomNumber}
        }
    }).promise()

    await pushMessage(connectionId, type, {roomNumber: data.roomNumber})
}

async function createOffer({type, data}, connectionId) {
    await pushMessage(data.toId, 'CREATE_ANSWER', {
        fromId: connectionId,
        sdp: data.sdp
    })
}

async function createAnswer({type, data}, connectionId) {
    await pushMessage(data.toId, 'GET_ANSWER', {
        fromId: connectionId,
        sdp: data.sdp
    })
}

async function candidate({type, data}, connectionId) {
    await pushMessage(data.toId, 'CANDIDATE', {
        fromId: connectionId,
        sdp: data.candidate
    })
}

async function pushMessage(
    targetConnectionId,
    type,
    data
) {
    console.log(`pushMessage to ${targetConnectionId}`, type, data)
    return api.postToConnection(
        {
            ConnectionId: targetConnectionId,
            Data: Buffer.from(JSON.stringify({type: type, data: data}))
        }
    ).promise()
}

function handleAwsOutput(err, data) {
    if (err) console.error(err);
    else return data
}