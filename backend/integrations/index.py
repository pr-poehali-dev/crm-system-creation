"""Единая функция для всех интеграций: Google Calendar, ЮKassa, экспорт .ics"""
import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from base64 import b64encode

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

# ========== GOOGLE CALENDAR ==========

def get_google_access_token():
    client_id = os.environ.get('GOOGLE_CALENDAR_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CALENDAR_CLIENT_SECRET')
    refresh_token = os.environ.get('GOOGLE_CALENDAR_REFRESH_TOKEN')
    
    if not all([client_id, client_secret, refresh_token]):
        return None
        
    response = requests.post('https://oauth2.googleapis.com/token', data={
        'client_id': client_id,
        'client_secret': client_secret,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token'
    })
    
    return response.json().get('access_token') if response.status_code == 200 else None

def create_google_calendar_event(booking: Dict[str, Any]) -> Dict[str, Any]:
    access_token = get_google_access_token()
    if not access_token:
        return {'error': 'No Google Calendar access token'}
    
    # Обработка дат (могут быть строками или datetime объектами)
    try:
        start_date = booking['start_date']
        end_date = booking['end_date']
        
        if isinstance(start_date, str):
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start = start_date
        
        if isinstance(end_date, str):
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        else:
            end = end_date
        
        # Валидация дат
        if start.year < 1900 or start.year > 2100 or end.year < 1900 or end.year > 2100:
            return {'error': 'Invalid date range in booking'}
    except Exception as e:
        return {'error': f'Date parsing error: {str(e)}'}
    
    event = {
        'summary': f"🚗 {booking['client_name']} - {booking.get('vehicle_model', 'Авто')}",
        'description': (
            f"Клиент: {booking['client_name']}\n"
            f"Телефон: {booking['client_phone']}\n"
            f"Автомобиль: {booking.get('vehicle_model', 'Не указано')}\n"
            f"Стоимость: ₽{booking.get('total_price', 0):,}\n"
            f"Статус: {booking['status']}"
        ),
        'start': {'dateTime': start.isoformat(), 'timeZone': 'Europe/Moscow'},
        'end': {'dateTime': end.isoformat(), 'timeZone': 'Europe/Moscow'},
        'colorId': '7',
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'popup', 'minutes': 1440},
                {'method': 'popup', 'minutes': 60},
            ],
        },
    }
    
    response = requests.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'},
        json=event
    )
    
    if response.status_code == 200:
        data = response.json()
        return {'success': True, 'event_id': data['id'], 'event_link': data.get('htmlLink')}
    return {'error': response.text}

# ========== YUKASSA PAYMENTS ==========

def get_yukassa_auth():
    shop_id = os.environ.get('YUKASSA_SHOP_ID')
    secret_key = os.environ.get('YUKASSA_SECRET_KEY')
    if not shop_id or not secret_key:
        return None
    credentials = f"{shop_id}:{secret_key}"
    return f"Basic {b64encode(credentials.encode()).decode()}"

def create_yukassa_payment(booking_id: int, amount: float, description: str, return_url: str) -> Dict[str, Any]:
    auth = get_yukassa_auth()
    if not auth:
        return {'error': 'ЮKassa не настроена'}
    
    payload = {
        'amount': {'value': f'{amount:.2f}', 'currency': 'RUB'},
        'confirmation': {'type': 'redirect', 'return_url': return_url},
        'capture': True,
        'description': description,
        'metadata': {'booking_id': booking_id}
    }
    
    response = requests.post(
        'https://api.yookassa.ru/v3/payments',
        headers={
            'Authorization': auth,
            'Idempotence-Key': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        },
        json=payload
    )
    
    return response.json() if response.status_code == 200 else {'error': response.text}

def check_yukassa_payment(payment_id: str) -> Dict[str, Any]:
    auth = get_yukassa_auth()
    if not auth:
        return {'error': 'ЮKassa не настроена'}
    
    response = requests.get(
        f'https://api.yookassa.ru/v3/payments/{payment_id}',
        headers={'Authorization': auth}
    )
    return response.json() if response.status_code == 200 else {'error': response.text}

# ========== ICS EXPORT ==========

def format_ics_datetime(dt_input) -> str:
    try:
        if isinstance(dt_input, str):
            dt = datetime.fromisoformat(dt_input.replace('Z', '+00:00'))
        else:
            dt = dt_input
        
        # Валидация года (защита от некорректных данных)
        if dt.year < 1900 or dt.year > 2100:
            return datetime.now().strftime('%Y%m%dT%H%M%S')
        
        return dt.strftime('%Y%m%dT%H%M%S')
    except:
        return datetime.now().strftime('%Y%m%dT%H%M%S')

def escape_ics(text: str) -> str:
    if not text:
        return ''
    return text.replace('\\', '\\\\').replace(',', '\\,').replace(';', '\\;').replace('\n', '\\n')

def generate_ics(bookings: List[Dict]) -> str:
    events = []
    for b in bookings:
        start = format_ics_datetime(b['start_date'])
        end = format_ics_datetime(b['end_date'])
        summary = f"{b['client_name']} - {b.get('vehicle_model', 'Авто')}"
        desc = f"Клиент: {b['client_name']}\\nТелефон: {b['client_phone']}\\nАвто: {b.get('vehicle_model', '?')}"
        
        events.append(f"""BEGIN:VEVENT
UID:booking-{b['id']}@crm.rf.ru
DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}
DTSTART:{start}
DTEND:{end}
SUMMARY:{escape_ics(summary)}
DESCRIPTION:{escape_ics(desc)}
STATUS:CONFIRMED
END:VEVENT""")
    
    return f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CRM RF//Bookings//RU
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Бронирования
X-WR-TIMEZONE:Europe/Moscow
{''.join(events)}
END:VCALENDAR"""

# ========== HANDLER ==========

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action', '')
        
        # ===== GOOGLE CALENDAR SYNC =====
        if action == 'google_sync':
            booking_id = params.get('booking_id')
            conn = get_db_connection()
            cursor = conn.cursor()
            
            if booking_id:
                cursor.execute("SELECT * FROM bookings WHERE id = %s", (booking_id,))
                booking = cursor.fetchone()
                if not booking:
                    return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Booking not found'}), 'isBase64Encoded': False}
                
                result = create_google_calendar_event(dict(booking))
                if result.get('success'):
                    cursor.execute("UPDATE bookings SET google_calendar_event_id = %s WHERE id = %s", (result['event_id'], booking_id))
                    conn.commit()
                conn.close()
                return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(result), 'isBase64Encoded': False}
            
            else:
                cursor.execute("""
                    SELECT id FROM bookings 
                    WHERE status IN ('Бронь', 'В аренде') 
                    AND (google_calendar_event_id IS NULL OR google_calendar_event_id = '')
                    AND EXTRACT(YEAR FROM start_date) BETWEEN 1900 AND 2100
                    AND EXTRACT(YEAR FROM end_date) BETWEEN 1900 AND 2100
                """)
                bookings = cursor.fetchall()
                results = []
                for b in bookings:
                    cursor.execute("SELECT * FROM bookings WHERE id = %s", (b['id'],))
                    booking = cursor.fetchone()
                    result = create_google_calendar_event(dict(booking))
                    if result.get('success'):
                        cursor.execute("UPDATE bookings SET google_calendar_event_id = %s WHERE id = %s", (result['event_id'], b['id']))
                    results.append(result)
                conn.commit()
                conn.close()
                return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps({'synced': len([r for r in results if r.get('success')]), 'results': results}), 'isBase64Encoded': False}
        
        # ===== PAYMENT CREATE =====
        elif action == 'payment_create' and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            booking_id = body.get('booking_id')
            amount = body.get('amount')
            return_url = body.get('return_url', 'https://your-site.com/success')
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM bookings WHERE id = %s", (booking_id,))
            booking = cursor.fetchone()
            if not booking:
                conn.close()
                return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Booking not found'}), 'isBase64Encoded': False}
            
            description = f"Оплата брони #{booking_id} - {booking['client_name']}"
            payment = create_yukassa_payment(booking_id, amount, description, return_url)
            
            if payment.get('id'):
                cursor.execute("UPDATE bookings SET payments = COALESCE(payments, '[]'::jsonb) || %s::jsonb WHERE id = %s", 
                              (json.dumps([{'payment_id': payment['id'], 'amount': amount, 'status': payment['status'], 'created_at': payment['created_at'], 'url': payment['confirmation']['confirmation_url']}]), booking_id))
                conn.commit()
            conn.close()
            
            return {'statusCode': 200 if payment.get('id') else 400, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(payment), 'isBase64Encoded': False}
        
        # ===== PAYMENT CHECK =====
        elif action == 'payment_check':
            payment_id = params.get('payment_id')
            payment = check_yukassa_payment(payment_id)
            
            if payment.get('status') == 'succeeded':
                booking_id = payment.get('metadata', {}).get('booking_id')
                if booking_id:
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    cursor.execute("UPDATE bookings SET paid_amount = paid_amount + %s WHERE id = %s", (float(payment['amount']['value']), booking_id))
                    conn.commit()
                    conn.close()
            
            return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(payment), 'isBase64Encoded': False}
        
        # ===== ICS EXPORT =====
        elif action == 'export_ics':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM bookings 
                WHERE status IN ('Бронь', 'В аренде', 'Оплачено') 
                AND EXTRACT(YEAR FROM start_date) BETWEEN 1900 AND 2100
                AND EXTRACT(YEAR FROM end_date) BETWEEN 1900 AND 2100
                ORDER BY start_date
            """)
            bookings = cursor.fetchall()
            conn.close()
            
            ics = generate_ics([dict(b) for b in bookings])
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/calendar; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="bookings.ics"',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': ics,
                'isBase64Encoded': False
            }
        
        else:
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Unknown action'}), 'isBase64Encoded': False}
            
    except Exception as e:
        return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps({'error': str(e)}), 'isBase64Encoded': False}