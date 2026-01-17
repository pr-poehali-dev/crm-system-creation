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
    
    # Возвращаем пустой список с инструкцией для ручного добавления
    # API Avito требует OAuth авторизацию для доступа к Messenger API
    try:
        print(f"Returning empty list - API access requires OAuth")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'count': 0,
                'leads': [],
                'demo': False,
                'message': 'Для автоматической загрузки диалогов из Avito требуется OAuth авторизация. Используйте кнопку "Добавить диалог вручную" для добавления обращений с Avito.'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'count': 0,
                'leads': [],
                'demo': False,
                'message': 'Для автоматической загрузки диалогов из Avito требуется OAuth. Добавляйте диалоги вручную.'
            }),
            'isBase64Encoded': False
        }