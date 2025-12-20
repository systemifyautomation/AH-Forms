#!/bin/bash
# Test curl for Amington Hall Staff Itinerary
# Based on Example 1: Saahira Sikander - Walima Event

# Replace YOUR_DEPLOYMENT_URL with your actual Google Apps Script deployment URL
ENDPOINT="YOUR_DEPLOYMENT_URL_HERE"

curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "client-name": "Saahira Sikander",
    "bride-name": "Saahira Sikander",
    "groom-name": "Hussan Aftab Choudhry",
    "ethnicity": "Asian",
    "event-date": "2025-10-19",
    "event-type": "Walima",
    "event-timings": "12pm - 4:30pm",
    "walkthrough-date": "2025-10-15",
    
    "primary-contact-name": "Shahbaz Choudhry",
    "primary-contact-relationship": "Groom'\''s Brother",
    "primary-contact-phone-prefix": "+44",
    "primary-contact-phone": "7903422999",
    
    "suite-hired": "Serenity Suite",
    "guest-count": "120",
    "table-type": "Round Tables",
    "guest-arrangements": "Mixed Family Seating",
    "table-settings": "Standard",
    "reserved-seatings": "40",
    "head-table": "Yes",
    "dance-floor": "Yes",
    
    "table-gift": "on",
    "table-nendra": "off",
    "favours": "Yes",
    "favours-type": "2 different types to be put on each plate",
    
    "wedding-cake": "Yes",
    "cake-company-name": "Cesti Bons Cake",
    "cake-contact-name": "Samera",
    "cake-contact-number-prefix": "+44",
    "cake-contact-number": "7717493108",
    "cake-tiers": "3",
    
    "decor-company-name": "Custom Decor Setup",
    "decor-contact-name": "Wedding Team",
    "decor-contact-number-prefix": "+44",
    "decor-contact-number": "7700900000",
    "decor-description": "Glass candelabras on 4 front Tables, Pom Poms & Gold Candelabras, Pillars for walkway",
    
    "photographer": "Yes",
    "photographer-company-name": "VIP Media Group",
    "photographer-contact-name": "Photography Team",
    "photographer-contact-number-prefix": "+44",
    "photographer-contact-number": "7974722722",
    
    "videographer": "No",
    
    "cinematography-equipment": "No",
    
    "sound-system": "DJ",
    "dj-name": "Prestine Sounds",
    "dj-contact-number-prefix": "+44",
    "dj-contact-number": "7450560555",
    
    "special-effects-type": "Low fog",
    "special-effects-time": "Bride entrance",
    
    "sweet-setups-type": "360 Photo Booth",
    "sweet-setups-time": "In front of Bar - After Food",
    
    "dancefloor": "Yes"
  }'

echo ""
echo "Test submission sent!"
