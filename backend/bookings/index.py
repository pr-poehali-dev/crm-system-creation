"""API для управления бронированиями с полной информацией о клиенте, услугах и финансах"""

import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p81623955_crm_system_creation'

def get_db_connection():
    """Создает подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor, options=f'-c search_path={SCHEMA}')

def handler(event: dict, context) -> dict:
    """API для управления бронированиями"""
    print(f"Bookings API called: {event.get('httpMethod', 'GET')}")
    method = event.get('httpMethod', 'GET') 
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        conn = get_db_connection()
        
        if method == 'GET':
            return get_bookings(conn, event)
        elif method == 'POST':
            return create_booking(conn, event)
        elif method == 'PUT':
            return update_booking(conn, event)
        elif method == 'DELETE':
            return delete_booking(conn, event)
        else:
            return error_response(405, 'Method not allowed')
            
    except Exception as e:
        return error_response(500, str(e))
    finally:
        if conn:
            conn.close()

def get_bookings(conn, event: dict) -> dict:
    """Получить список бронирований с фильтрацией"""
    print("Fetching bookings...")
    params = event.get('queryStringParameters', {}) or {}
    booking_id = params.get('id')
    status = params.get('status')
    vehicle_id = params.get('vehicle_id')
    date_from = params.get('date_from')
    date_to = params.get('date_to')
    
    cursor = conn.cursor()
    
    # Если запрашивается конкретная бронь
    if booking_id:
        cursor.execute("""
            SELECT b.*, 
                   f.model as vehicle_model_full,
                   f.license_plate as vehicle_plate_full
            FROM bookings b
            LEFT JOIN fleet f ON b.vehicle_id = f.id
            WHERE b.id = %s
        """, (booking_id,))
        booking = cursor.fetchone()
        
        if not booking:
            return error_response(404, 'Booking not found')
        
        return success_response({'booking': dict(booking)})
    
    # Построение динамического запроса с фильтрами
    query = """
        SELECT b.*,
               f.model as vehicle_model_full,
               f.license_plate as vehicle_plate_full
        FROM bookings b
        LEFT JOIN fleet f ON b.vehicle_id = f.id
        WHERE 1=1
        AND EXTRACT(YEAR FROM b.start_date) < 2100
        AND EXTRACT(YEAR FROM b.end_date) < 2100
    """
    query_params = []
    
    if status:
        query += " AND b.status = %s"
        query_params.append(status)
    
    if vehicle_id:
        query += " AND b.vehicle_id = %s"
        query_params.append(int(vehicle_id))
    
    if date_from:
        query += " AND b.end_date >= %s"
        query_params.append(date_from)
    
    if date_to:
        query += " AND b.start_date <= %s"
        query_params.append(date_to)
    
    query += " ORDER BY b.created_at DESC"
    
    cursor.execute(query, query_params)
    bookings = cursor.fetchall()
    
    return success_response({
        'bookings': [dict(b) for b in bookings],
        'total': len(bookings)
    })

def create_booking(conn, event: dict) -> dict:
    """Создать новое бронирование"""
    try:
        data = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return error_response(400, 'Invalid JSON')
    
    # Обязательные поля
    required = ['client_name', 'client_phone', 'start_date', 'end_date']
    for field in required:
        if field not in data:
            return error_response(400, f'Missing required field: {field}')
    
    cursor = conn.cursor()
    
    # Очистка старых черновиков этого клиента (более 1 часа)
    if data.get('status') == 'Черновик':
        cursor.execute("""
            DELETE FROM bookings 
            WHERE client_phone = %s 
            AND status = 'Черновик' 
            AND created_at < NOW() - INTERVAL '1 hour'
        """, (data['client_phone'],))
    
    # Получение данных об автомобиле если указан vehicle_id
    vehicle_model = data.get('vehicle_model')
    vehicle_plate = data.get('vehicle_license_plate')
    
    if data.get('vehicle_id'):
        cursor.execute(
            "SELECT model, license_plate FROM fleet WHERE id = %s",
            (data['vehicle_id'],)
        )
        vehicle = cursor.fetchone()
        if vehicle:
            vehicle_model = vehicle['model']
            vehicle_plate = vehicle['license_plate']
    
    # Вставка брони с расширенными полями
    cursor.execute("""
        INSERT INTO bookings (
            client_name, client_phone, client_email, client_birth_date,
            client_passport_series, client_passport_number, client_passport_issued_by, 
            client_passport_issued_date, client_passport_registration,
            client_driver_license_series, client_driver_license_number,
            client_driver_license_issued_date, client_driver_license_issued_by,
            client_is_foreign,
            vehicle_id, vehicle_model, vehicle_license_plate,
            start_date, end_date, days, 
            pickup_location, dropoff_location,
            route_type, is_international, planned_km_total,
            status, booking_type, total_price, paid_amount, deposit_amount,
            deposit_status, deposit_hold_method,
            services, rental_days, rental_km, rental_price_per_day, rental_price_per_km,
            has_child_seat, child_seat_count, has_gps, has_winter_tires, 
            has_roof_rack, has_additional_driver, additional_driver_name,
            insurance_type, insurance_cost, fuel_policy,
            communication_channel, source,
            notes, custom_fields, payments, internal_notes,
            created_by, assigned_manager
        ) VALUES (
            %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s,
            %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s,
            %s::jsonb, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s,
            %s, %s::jsonb, %s::jsonb, %s,
            %s, %s
        ) RETURNING id
    """, (
        data['client_name'],
        data['client_phone'],
        data.get('client_email'),
        data.get('client_birth_date'),
        data.get('client_passport_series'),
        data.get('client_passport_number'),
        data.get('client_passport_issued_by'),
        data.get('client_passport_issued_date'),
        data.get('client_passport_registration'),
        data.get('client_driver_license_series'),
        data.get('client_driver_license_number'),
        data.get('client_driver_license_issued_date'),
        data.get('client_driver_license_issued_by'),
        data.get('client_is_foreign', False),
        data.get('vehicle_id'),
        vehicle_model,
        vehicle_plate,
        data['start_date'],
        data['end_date'],
        data.get('days', 1),
        data.get('pickup_location'),
        data.get('dropoff_location'),
        data.get('route_type'),
        data.get('is_international', False),
        data.get('planned_km_total'),
        data.get('status', 'Бронь'),
        data.get('booking_type', 'rent'),
        data.get('total_price', 0),
        data.get('paid_amount', 0),
        data.get('deposit_amount', 0),
        data.get('deposit_status', 'pending'),
        data.get('deposit_hold_method'),
        json.dumps(data.get('services', [])),
        data.get('rental_days'),
        data.get('rental_km'),
        data.get('rental_price_per_day'),
        data.get('rental_price_per_km'),
        data.get('has_child_seat', False),
        data.get('child_seat_count', 0),
        data.get('has_gps', False),
        data.get('has_winter_tires', False),
        data.get('has_roof_rack', False),
        data.get('has_additional_driver', False),
        data.get('additional_driver_name'),
        data.get('insurance_type'),
        data.get('insurance_cost', 0),
        data.get('fuel_policy', 'full-to-full'),
        data.get('communication_channel'),
        data.get('source'),
        data.get('notes'),
        json.dumps(data.get('custom_fields', [])),
        json.dumps(data.get('payments', [])),
        data.get('internal_notes'),
        data.get('created_by'),
        data.get('assigned_manager')
    ))
    
    booking_id = cursor.fetchone()['id']
    conn.commit()
    
    # Получаем полную информацию о созданной брони
    cursor.execute("""
        SELECT b.*, 
               f.model as vehicle_model_full,
               f.license_plate as vehicle_plate_full
        FROM bookings b
        LEFT JOIN fleet f ON b.vehicle_id = f.id
        WHERE b.id = %s
    """, (booking_id,))
    booking = cursor.fetchone()
    
    return success_response({
        'booking': dict(booking) if booking else {'id': booking_id},
        'message': 'Booking created successfully'
    }, status_code=201)

def update_booking(conn, event: dict) -> dict:
    """Обновить бронирование"""
    try:
        data = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return error_response(400, 'Invalid JSON')
    
    # ID может быть в query params или в body
    params = event.get('queryStringParameters', {}) or {}
    booking_id = params.get('id') or data.get('id')
    
    if not booking_id:
        return error_response(400, 'Missing booking id')
    
    cursor = conn.cursor()
    
    # Проверка существования брони
    cursor.execute("SELECT id FROM bookings WHERE id = %s", (booking_id,))
    if not cursor.fetchone():
        return error_response(404, 'Booking not found')
    
    # Динамическое построение UPDATE запроса
    update_fields = []
    values = []
    
    simple_fields = [
        'client_name', 'client_phone', 'vehicle_id', 'vehicle_model', 'vehicle_license_plate',
        'start_date', 'end_date', 'days', 'pickup_location', 'dropoff_location',
        'status', 'total_price', 'paid_amount', 'deposit_amount',
        'rental_days', 'rental_km', 'rental_price_per_day', 'rental_price_per_km',
        'notes'
    ]
    
    for field in simple_fields:
        if field in data:
            update_fields.append(f"{field} = %s")
            values.append(data[field])
    
    # JSON поля
    json_fields = ['services', 'custom_fields', 'payments']
    for field in json_fields:
        if field in data:
            update_fields.append(f"{field} = %s::jsonb")
            values.append(json.dumps(data[field]))
    
    if not update_fields:
        return error_response(400, 'No fields to update')
    
    values.append(booking_id)
    query = f"UPDATE bookings SET {', '.join(update_fields)} WHERE id = %s"
    
    cursor.execute(query, values)
    conn.commit()
    
    # Получаем обновлённую бронь
    cursor.execute("""
        SELECT b.*, 
               f.model as vehicle_model_full,
               f.license_plate as vehicle_plate_full
        FROM bookings b
        LEFT JOIN fleet f ON b.vehicle_id = f.id
        WHERE b.id = %s
    """, (booking_id,))
    booking = cursor.fetchone()
    
    return success_response({
        'booking': dict(booking) if booking else {'id': booking_id},
        'message': 'Booking updated successfully'
    })

def delete_booking(conn, event: dict) -> dict:
    """Удалить бронирование (мягкое удаление - меняем статус)"""
    params = event.get('queryStringParameters', {}) or {}
    booking_id = params.get('id')
    
    if not booking_id:
        return error_response(400, 'Missing booking id')
    
    cursor = conn.cursor()
    
    # Мягкое удаление - меняем статус на "Отменено"
    cursor.execute(
        "UPDATE bookings SET status = 'Отменено' WHERE id = %s RETURNING id",
        (booking_id,)
    )
    
    result = cursor.fetchone()
    if not result:
        return error_response(404, 'Booking not found')
    
    conn.commit()
    
    return success_response({'message': 'Booking cancelled successfully'})

def success_response(data: dict, status_code: int = 200) -> dict:
    """Успешный ответ"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, default=str),
        'isBase64Encoded': False
    }

def error_response(status_code: int, message: str) -> dict:
    """Ответ с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }