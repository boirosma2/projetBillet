#!/bin/bash

# User Registration
echo "=== User Registration ==="
curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser", "email":"testuser@example.com", "password":"password123"}'

# User Login
echo -e "\n=== User Login ==="
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com", "password":"password123"}'

# List Events
echo -e "\n=== List Events ==="
curl http://localhost:3000/api/events

# Create Event
echo -e "\n=== Create Event ==="
curl -X POST http://localhost:3000/api/events \
     -H "Content-Type: application/json" \
     -d '{
         "title": "Rock Concert 2024",
         "description": "Epic rock music festival",
         "date": "2024-08-20 20:00:00",
         "venue": "Stadium Arena",
         "total_tickets": 5000,
         "price": 85.00
     }'

# Purchase Ticket
echo -e "\n=== Purchase Ticket ==="
curl -X POST http://localhost:3000/api/tickets \
     -H "Content-Type: application/json" \
     -d '{"event_id": 1, "user_id": 1}'

# Get User Tickets
echo -e "\n=== Get User Tickets ==="
curl http://localhost:3000/api/tickets/user/1
