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
    const users = await ddb.scan({
        TableName: 'user',
        FilterExpression: 'connectionId = :connectionId',
        ExpressionAttributeValues: {":connectionId": {S: connectionId}},
    }, handleAwsOutput).promise();

    for (const user of users.Items) {
        await ddb.deleteItem({
            TableName: 'user',
            Key: {id: {N: user.id.N}, connectionId: {S: connectionId}}
        }, handleAwsOutput).promise();

        if (user.currentRoomId) {
            await deleteRoomUser(user.id.N, user.currentRoomId.N);
        }
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
        case 'EXIT_ROOM':
            return await exitRoom(message, connectionId);
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

async function createRoom({type, data, uid}, connectionId) {
    const roomId = `${Math.floor(Math.random() * 100000)}`

    await ddb.putItem({
        TableName: 'room',
        Item: {id: {N: roomId}, title: {S: data.title}}
    }).promise();

    await ddb.putItem({
        TableName: 'room-user',
        Item: {uid: {N: `${uid}`}, roomId: {N: roomId}, connectionId: {S: connectionId}}
    }).promise();

    await pushMessage(connectionId, type, {roomNumber: roomId});
}

async function getRooms({type, data}, connectionId) {
    const result = await ddb.scan({TableName: 'room'}, handleAwsOutput).promise();
    await pushMessage(connectionId, type, {
            rooms: result.Items.map(row => ({
                roomNumber: row.id.N,
                title: row.title.S,
                member: 0
            }))
        }
    )
}

async function joinRoom({type, data, uid}, connectionId) {
    const user = await getUser(uid, connectionId);
    if (user.currentRoomId) {
        await deleteRoomUser(uid, user.currentRoomId.N)
    }

    const roomUsers = await getRoomUsersByRoomId(data.roomNumber).then(result => result.Items)

    for (const roomUser of roomUsers) {
        if (roomUser.connectionId.S !== connectionId) {
            await pushMessage(
                roomUser.connectionId.S,
                'INIT_CONNECTION',
                {id: connectionId},
            ).catch(e => console.log('INIT_CONNECTION_FAIL', e, roomUser.connectionId));
        }
    }

    await ddb.updateItem({
        TableName: 'user',
        Key: {"id": {N: `${uid}`}, "connectionId": {S: connectionId}},
        UpdateExpression: "SET currentRoomId = :currentRoomId",
        ExpressionAttributeValues: {":currentRoomId": {N: `${data.roomNumber}`}},
    }).promise();

    await ddb.putItem({
        TableName: 'room-user',
        Item: {uid: {N: `${uid}`}, roomId: {N: `${data.roomNumber}`}, connectionId: {S: connectionId}}
    }).promise()

    await pushMessage(connectionId, type, {roomNumber: data.roomNumber})
}

async function exitRoom({type, data, uid}, connectionId) {
    const user = await getUser(uid, connectionId);

    await deleteRoomUser(uid, user.currentRoomId.N)

    await ddb.updateItem({
        TableName: 'user',
        Key: {"id": {N: `${uid}`}, "connectionId": {S: connectionId}},
        UpdateExpression: "REMOVE currentRoomId"
    }).promise();
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

async function getUser(uid, connectionId) {
    return ddb.getItem({
        TableName: 'user',
        Key: {"id": {N: `${uid}`}, "connectionId": {S: connectionId}},
    }).promise().then(result => result.Item);
}

async function getRoomUsersByRoomId(roomId) {
    return ddb.scan({
        TableName: 'room-user',
        FilterExpression: 'roomId = :roomId',
        ExpressionAttributeValues: {":roomId": {N: `${roomId}`}},
    }, handleAwsOutput).promise()
}

async function deleteRoomUser(uid, roomId) {
    await ddb.deleteItem({
        TableName: 'room-user',
        Key: {uid: {N: `${uid}`}, roomId: {N: `${roomId}`}}
    }, handleAwsOutput).promise();

    const roomUsers = await getRoomUsersByRoomId(roomId)

    if (roomUsers.Count === 0) {
        await ddb.deleteItem({
            TableName: 'room',
            Key: {id: {N: `${roomId}`}}
        }).promise()
    }
}