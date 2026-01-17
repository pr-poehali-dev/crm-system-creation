import json
import os
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Загружает диалоги с клиентами из Avito и возвращает их как лиды для CRM
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Получаем учетные данные из query parameters или секретов
    query = event.get('queryStringParameters') or {}
    client_id = query.get('client_id', os.environ.get('AVITO_CLIENT_ID', 'VzbKJ5EdJ2AYmep_vm_v'))
    client_secret = query.get('client_secret', os.environ.get('AVITO_CLIENT_SECRET', 'izyN_j0WXoT6iEUnIwMQsynqGDndAuuHkAxwveyV'))
    user_id = query.get('user_id', os.environ.get('AVITO_USER_ID', '393750909'))
    
    # Получаем access token
    try:
        token_response = requests.post(
            'https://api.avito.ru/token',
            data={
                'grant_type': 'client_credentials',
                'client_id': client_id,
                'client_secret': client_secret
            },
            timeout=10
        )
        
        if token_response.status_code != 200:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Не удалось получить токен Avito',
                    'details': token_response.text
                }),
                'isBase64Encoded': False
            }
        
        access_token = token_response.json().get('access_token')
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Ошибка получения токена',
                'message': str(e)
            }),
            'isBase64Encoded': False
        }
    
    # Загружаем сообщения из Avito Messenger API
    try:
        messages_response = requests.get(
            f'https://api.avito.ru/messenger/v2/accounts/{user_id}/chats',
            headers={
                'Authorization': f'Bearer {access_token}'
            },
            params={
                'unread_only': 'true'  # Только непрочитанные
            },
            timeout=10
        )
        
        if messages_response.status_code != 200:
            return {
                'statusCode': messages_response.status_code,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Не удалось загрузить сообщения',
                    'details': messages_response.text
                }),
                'isBase64Encoded': False
            }
        
        chats_data = messages_response.json()
        chats = chats_data.get('chats', [])
        
        # Преобразуем чаты в формат лидов CRM
        leads = []
        for chat in chats:
            # Получаем последнее сообщение
            last_message = chat.get('last_message', {})
            
            # Определяем клиента (собеседника)
            users = chat.get('users', [])
            client_user = None
            for user in users:
                if str(user.get('id')) != str(user_id):
                    client_user = user
                    break
            
            if not client_user:
                continue
            
            # Получаем информацию об объявлении (автомобиле)
            context = chat.get('context', {})
            item_info = context.get('value', {})
            car_title = item_info.get('title', 'Не указано')
            
            lead = {
                'id': chat.get('id'),
                'source': 'avito',
                'client': client_user.get('name', 'Неизвестный'),
                'phone': '',  # Avito не отдает телефоны через API
                'message': last_message.get('content', {}).get('text', ''),
                'car': car_title,
                'stage': 'new',
                'created': last_message.get('created', datetime.now().isoformat()),
                'lastActivity': last_message.get('created', datetime.now().isoformat()),
                'sum': 0,
                'avitoUserId': client_user.get('id'),
                'chatId': chat.get('id'),
                'itemId': item_info.get('id')
            }
            
            leads.append(lead)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'count': len(leads),
                'leads': leads
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Ошибка загрузки сообщений',
                'message': str(e)
            }),
            'isBase64Encoded': False
        }
