import json
import os
import requests

def handler(event: dict, context) -> dict:
    """
    Обрабатывает OAuth callback от Avito и обменивает authorization code на refresh token
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Получаем authorization code из query параметров
    query_params = event.get('queryStringParameters', {})
    auth_code = query_params.get('code')
    
    if not auth_code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': 'Не получен код авторизации от Avito'
            }),
            'isBase64Encoded': False
        }
    
    # Получаем учетные данные
    client_id = os.environ.get('AVITO_CLIENT_ID')
    client_secret = os.environ.get('AVITO_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': 'Не настроены ключи Avito'
            }),
            'isBase64Encoded': False
        }
    
    # Обмениваем код на refresh token
    try:
        token_response = requests.post(
            'https://api.avito.ru/token',
            data={
                'grant_type': 'authorization_code',
                'code': auth_code,
                'client_id': client_id,
                'client_secret': client_secret
            },
            timeout=10
        )
        
        if token_response.status_code != 200:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Не удалось получить токен от Avito',
                    'details': token_response.text
                }),
                'isBase64Encoded': False
            }
        
        token_data = token_response.json()
        refresh_token = token_data.get('refresh_token')
        
        if not refresh_token:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Refresh token не получен',
                    'details': token_data
                }),
                'isBase64Encoded': False
            }
        
        # Возвращаем HTML страницу которая отправит сообщение родительскому окну
        html_response = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Avito Authorization Success</title>
            <style>
                body {{
                    font-family: system-ui, -apple-system, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }}
                .success-box {{
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 400px;
                }}
                .checkmark {{
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #10b981;
                    margin: 0 auto 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    color: white;
                }}
                h1 {{
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }}
                p {{
                    color: #6b7280;
                    margin-bottom: 1rem;
                }}
            </style>
        </head>
        <body>
            <div class="success-box">
                <div class="checkmark">✓</div>
                <h1>Успешно!</h1>
                <p>Avito подключен к вашей CRM</p>
                <p style="font-size: 0.875rem;">Это окно можно закрыть</p>
            </div>
            <script>
                // Отправляем сообщение родительскому окну
                if (window.opener) {{
                    window.opener.postMessage({{
                        type: 'avito-oauth-success',
                        refresh_token: '{refresh_token}'
                    }}, '*');
                }}
                // Автоматически закрываем окно через 2 секунды
                setTimeout(() => {{
                    window.close();
                }}, 2000);
            </script>
        </body>
        </html>
        """
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*'},
            'body': html_response,
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }),
            'isBase64Encoded': False
        }