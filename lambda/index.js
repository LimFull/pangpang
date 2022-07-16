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
            console.log('[handler]', 'Disconnection occurred')

            const result = await ddb.scan({
                TableName: 'rtc-connection',
                FilterExpression: 'connectionId = :connectionId',
                ExpressionAttributeValues: {":connectionId": {S: connectionId}},
            }, function (err, data) {
                if (err) console.log(err);
                else return data
            }).promise();

            result.Items.forEach(async row => {
                console.log(row)
                await ddb.deleteItem({
                    TableName: 'rtc-connection',
                    Key: {
                        roomNumber: {N: row.roomNumber.N},
                        connectionId: {S: connectionId}
                    }
                }, function (err, data) {
                    if (err) console.log(err);
                    else return data
                }).promise();
            })

            break
        case '$default':
            console.log('[handler]', 'Received message:', event.body)
            await replyToMessage(
                await handleMessageData(
                    JSON.parse(event.body),
                    connectionId
                ),
                connectionId
            )
            break
        default:
            console.log('[handler]', 'Received unknown route:', route)
    }

    return {
        statusCode: 200
    }
}

async function handleMessageData(message, connectionId) {
    console.log('handleMessageData', message)
    switch (message.type) {
        case 'CREATE_ROOM': {
            const roomNumber = `${Math.floor(Math.random() * 100000)}`
            await ddb.putItem({
                TableName: 'room',
                Item: {
                    roomNumber: {N: roomNumber},
                    title: {S: message.data.title}
                }
            }).promise()
            await ddb.putItem({
                TableName: 'rtc-connection',
                Item: {
                    connectionId: {S: connectionId},
                    roomNumber: {N: roomNumber}
                }
            }).promise()
            return {type: message.type, data: {roomNumber: roomNumber}}
        }

        case 'GET_ROOMS': {
            const result = await ddb.scan({
                TableName: 'room'
            }, function (err, data) {
                if (err) console.log(err);
                else return data
            }).promise();
            await replyToMessage({type: 'CREATE_ID', data: {id: connectionId}}, connectionId)
            return {
                type: message.type,
                data: {
                    rooms: result.Items.map(row => {
                        return {
                            roomNumber: row.roomNumber.N,
                            title: row.title.S,
                            member: 0
                        }
                    })
                }
            }
        }

        case 'JOIN_ROOM': {
            const result = await ddb.scan({
                TableName: 'rtc-connection',
                FilterExpression: 'roomNumber = :joinRoomNumber',
                ExpressionAttributeValues: {":joinRoomNumber": {N: message.data.roomNumber}},
            }, function (err, data) {
                if (err) console.log(err);
                else return data
            }).promise();

            console.log('JOIN_ROOM', result);

            result.Items.forEach(async row => {
                if (row.connectionId.S !== connectionId) {
                    replyToMessage(
                        {type: 'INIT_CONNECTION', data: {id: connectionId}},
                        row.connectionId.S
                    )
                        .catch(e => console.log('INIT_CONNECTION_FAIL', e, row.connectionId));
                }
            })

            await ddb.putItem({
                TableName: 'rtc-connection',
                Item: {
                    connectionId: {S: connectionId},
                    roomNumber: {N: message.data.roomNumber}
                }
            }).promise()

            return {type: message.type, data: {roomNumber: message.data.roomNumber}}
        }

        case 'CREATE_OFFER': {
            await replyToMessage(
                {
                    type: 'CREATE_ANSWER',
                    data: {
                        fromId: connectionId,
                        sdp: message.data.sdp
                    }
                },
                message.data.toId
            )
            return
        }

        case 'CREATE_ANSWER': {
            await replyToMessage(
                {
                    type: 'GET_ANSWER',
                    data: {
                        fromId: connectionId,
                        sdp: message.data.sdp
                    }
                },
                message.data.toId
            )
            return
        }

        case 'CANDIDATE': {
            await replyToMessage(
                {
                    type: 'CANDIDATE',
                    data: {
                        fromId: connectionId,
                        candidate: message.data.candidate
                    }
                },
                message.data.toId
            )
            return
        }


        default:
            return {type: message.type, error: 'unknown data type'}
    }
}

async function replyToMessage(response, connectionId) {
    console.log('send response', connectionId, response);
    if (response) {
        return api.postToConnection(
            {
                ConnectionId: connectionId,
                Data: Buffer.from(JSON.stringify(response))
            }
        ).promise()
    }
}
