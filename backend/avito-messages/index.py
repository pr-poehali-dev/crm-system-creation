import json
import os
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Загружает реальные диалоги с Avito используя Messenger API
    """
    method = event.get('httpMethod', 'GET')
    
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
    
    # Получаем учетные данные из секретов
    client_id = os.environ.get('AVITO_CLIENT_ID')
    client_secret = os.environ.get('AVITO_CLIENT_SECRET')
    user_id = os.environ.get('AVITO_USER_ID')
    
    print(f"Loading Avito messages for user_id={user_id}")
    
    if not client_id or not client_secret or not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Не настроены ключи Avito',
                'message': 'Добавьте AVITO_CLIENT_ID, AVITO_CLIENT_SECRET и AVITO_USER_ID'
            }),
            'isBase64Encoded': False
        }
    
    # Получаем access token
    try:
        print(f"Getting Avito token...")
        token_response = requests.post(
            'https://api.avito.ru/token',
            data={
                'grant_type': 'client_credentials',
                'client_id': client_id,
                'client_secret': client_secret
            },
            timeout=10
        )
        
        print(f"Token response: {token_response.status_code}")
        
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
        print(f"Token error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Ошибка получения токена',
                'message': str(e)
            }),
            'isBase64Encoded': False
        }
    
    # Загружаем диалоги через Messenger API v3
    try:
        print(f"Fetching chats from Avito Messenger API v3...")
        
        # Используем публичный API для получения всех чатов
        chats_response = requests.get(
            f'https://api.avito.ru/messenger/v3/accounts/{user_id}/chats',
            headers={
                'Authorization': f'Bearer {access_token}'
            },
            params={
                'limit': 50  # Последние 50 диалогов
            },
            timeout=15
        )
        
        print(f"Chats response: {chats_response.status_code}")
        print(f"Response body: {chats_response.text[:500]}")
        
        if chats_response.status_code != 200:
            # Если v3 не работает, возвращаем информативную ошибку
            return {
                'statusCode': chats_response.status_code,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Не удалось загрузить диалоги',
                    'details': chats_response.text,
                    'api_version': 'v3',
                    'hint': 'Возможно, у приложения нет доступа к Messenger API. Проверьте права доступа на developers.avito.ru'
                }),
                'isBase64Encoded': False
            }
        
        chats_data = chats_response.json()
        chats = chats_data.get('chats', [])
        
        print(f"Found {len(chats)} chats")
        
        # Преобразуем чаты в формат лидов
        leads = []
        for chat in chats:
            chat_id = chat.get('id')
            last_message = chat.get('last_message', {})
            context = chat.get('context', {})
            
            # Получаем информацию о собеседнике
            users = chat.get('users', [])
            client_user = None
            for user in users:
                if str(user.get('id')) != str(user_id):
                    client_user = user
                    break
            
            if not client_user:
                continue
            
            # Получаем объявление
            item = context.get('value', {})
            
            lead = {
                'id': f'avito_{chat_id}',
                'source': 'avito',
                'client': client_user.get('name', 'Пользователь Avito'),
                'phone': '',  # Avito не отдает телефоны через API
                'message': last_message.get('content', {}).get('text', 'Нет текста'),
                'car': item.get('title', 'Не указано'),
                'stage': 'new',
                'created': last_message.get('created', datetime.now().isoformat()),
                'lastActivity': last_message.get('created', datetime.now().isoformat()),
                'sum': 0,
                'avitoUserId': client_user.get('id'),
                'chatId': chat_id,
                'itemId': item.get('id'),
                'unread': chat.get('users_unread_count', 0) > 0
            }
            
            leads.append(lead)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'count': len(leads),
                'leads': leads,
                'demo': False
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error loading chats: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Ошибка загрузки диалогов',
                'message': str(e)
            }),
            'isBase64Encoded': False
        }
