// Data Structuring and Validation Utility
// This file provides comprehensive data formatting for webhook submission

/**
 * Structures the raw form data into a well-organized object for backend/webhook submission
 * @param {Object} rawData - Raw data from localStorage
 * @returns {Object} Structured data object
 */
function structureFormData(rawData) {
    const structured = {
        submissionInfo: {
            submittedAt: rawData.submittedAt || new Date().toISOString(),
            lastSaved: rawData.lastSaved || null,
            formVersion: '1.0',
            reminderPhone: rawData.reminderPhone || null,
            reminderPhonePrefix: rawData.reminderPhonePrefix || null
        },
        
        eventDetails: {
            clientName: rawData['client-name'] || '',
            groomName: rawData['groom-name'] || '',
            brideName: rawData['bride-name'] || '',
            ethnicity: rawData.ethnicity || '',
            eventDate: rawData['event-date'] || '',
            eventTimings: rawData['event-timings'] || '',
            otherTimings: rawData['other-timings'] || null,
            walkthroughDate: rawData['walkthrough-date'] || '',
            numberOfAttendees: rawData['number-of-attendees'] || ''
        },
        
        keyContacts: {
            primaryContact: {
                name: rawData['primary-contact-name'] || '',
                phone: {
                    prefix: rawData['primary-contact-phone-prefix'] || '+44',
                    number: rawData['primary-contact-phone'] || ''
                },
                email: rawData['primary-contact-email'] || null
            },
            secondaryContact: rawData['secondary-contact'] === 'Yes' ? {
                name: rawData['secondary-contact-name'] || '',
                phone: {
                    prefix: rawData['secondary-contact-phone-prefix'] || '+44',
                    number: rawData['secondary-contact-phone'] || ''
                },
                email: rawData['secondary-contact-email'] || null
            } : null
        },
        
        seatingAndHall: {
            suiteHired: rawData['suite-hired'] || '',
            numberOfGuests: rawData['number-of-guests'] || '',
            tableType: rawData['table-type'] || '',
            guestArrangements: rawData['guest-arrangements'] || '',
            segregation: rawData['segregation'] === 'Yes' ? {
                enabled: true,
                menCount: rawData['men-count'] || '',
                womenCount: rawData['women-count'] || ''
            } : {
                enabled: false,
                menCount: null,
                womenCount: null
            },
            tableSettings: rawData['table-settings'] || '',
            reservedSeating: rawData['reserved-seating'] || '',
            headTable: rawData['head-table'] || '',
            danceFloor: rawData['dance-floor'] || '',
            additionalTables: {
                diningTables: rawData['additional-dining-tables'] === 'on',
                buffetTables: rawData['additional-buffet-tables'] === 'on',
                cakeTables: rawData['additional-cake-tables'] === 'on',
                other: rawData['additional-tables-other'] || null
            }
        },
        
        decor: {
            thirdPartyDecor: {
                companyName: rawData['decor-company-name'] || null,
                contactName: rawData['decor-contact-name'] || null,
                contactPhone: {
                    prefix: rawData['decor-contact-phone-prefix'] || null,
                    number: rawData['decor-contact-phone'] || null
                },
                contactEmail: rawData['decor-contact-email'] || null
            }
        },
        
        weddingCakeAndFavours: {
            weddingCake: rawData['wedding-cake'] === 'Yes' ? {
                enabled: true,
                companyName: rawData['cake-company-name'] || '',
                numberOfTiers: rawData['cake-tiers'] || '',
                contactName: rawData['cake-contact-name'] || '',
                contactPhone: {
                    prefix: rawData['cake-contact-phone-prefix'] || '+44',
                    number: rawData['cake-contact-phone'] || ''
                }
            } : {
                enabled: false
            },
            cakeKnife: rawData['cake-knife'] || null,
            favours: rawData['wedding-favours'] === 'Yes' ? {
                enabled: true,
                numberOfFavours: rawData['number-of-favours'] || '',
                typeOfFavours: rawData['type-of-favours'] || ''
            } : {
                enabled: false
            },
            menuCards: rawData['menu-cards'] || null,
            leftoverFavours: rawData['leftover-favours'] || null
        },
        
        ledLcdScreens: {
            screens: {
                amingtonStageScreen: rawData['amington-stage-screen'] || null,
                amingtonWallScreen: rawData['amington-wall-screen'] || null,
                serenityWallScreen: rawData['serenity-wall-screen'] || null,
                foyerScreen: rawData['foyer-screen'] || null
            },
            additionalDetails: rawData['screen-additional-details'] || null
        },
        
        visualsAndExternal: {
            photographer: rawData.photographer === 'Yes' ? {
                enabled: true,
                companyName: rawData['photographer-company-name'] || '',
                contactName: rawData['photographer-contact-name'] || '',
                contactPhone: {
                    prefix: rawData['photographer-contact-number-prefix'] || '+44',
                    number: rawData['photographer-contact-number'] || ''
                },
                email: rawData['photographer-email'] || ''
            } : {
                enabled: false
            },
            videographer: rawData.videographer === 'Yes' ? {
                enabled: true,
                companyName: rawData['videographer-company-name'] || '',
                contactName: rawData['videographer-contact-name'] || '',
                contactPhone: {
                    prefix: rawData['videographer-contact-number-prefix'] || '+44',
                    number: rawData['videographer-contact-number'] || ''
                },
                email: rawData['videographer-email'] || ''
            } : {
                enabled: false
            },
            cinematographyEquipment: rawData['cinematography-equipment'] || '',
            soundSystem: {
                type: rawData['sound-system'] || '',
                djHired: rawData['dj-hired'] === 'Yes' ? {
                    enabled: true,
                    djName: rawData['dj-name'] || '',
                    contactPhone: {
                        prefix: rawData['dj-contact-number-prefix'] || '+44',
                        number: rawData['dj-contact-number'] || ''
                    },
                    email: rawData['dj-email'] || ''
                } : {
                    enabled: false
                }
            }
        }
    };
    
    return structured;
}

/**
 * Validates required fields across all pages
 * @param {Object} data - Raw form data
 * @returns {Object} Validation result with status and missing fields
 */
function validateCompleteForm(data) {
    const missing = [];
    
    // Page 1 - Event Details
    if (!data['client-name']) missing.push('Client Name');
    if (!data['groom-name']) missing.push('Groom Name');
    if (!data['bride-name']) missing.push('Bride Name');
    if (!data.ethnicity) missing.push('Ethnicity');
    if (!data['event-date']) missing.push('Event Date');
    if (!data['event-timings']) missing.push('Event Timings');
    if (!data['walkthrough-date']) missing.push('Walkthrough Date');
    // Removed: number-of-attendees (field no longer exists)
    
    // Page 2 - Key Contacts
    if (!data['primary-contact-name']) missing.push('Primary Contact Name');
    if (!data['primary-contact-phone']) missing.push('Primary Contact Phone');
    
    // Page 3 - Seating & Hall
    if (!data['suite-hired']) missing.push('Suite Hired');
    if (!data['guest-count']) missing.push('Number of Guests');
    if (!data['table-type']) missing.push('Table Type');
    if (!data['guest-arrangements']) missing.push('Guest Arrangements');
    if (!data['table-settings']) missing.push('Table Settings');
    // reserved-seatings is OPTIONAL - not checked
    if (!data['head-table']) missing.push('Head Table');
    if (!data['dance-floor']) missing.push('Dance Floor');
    
    // Page 5 - Wedding Cake
    if (!data['wedding-cake']) missing.push('Wedding Cake Question');
    
    // Page 7 - Visuals & External
    if (!data.photographer) missing.push('Photographer Question');
    if (!data.videographer) missing.push('Videographer Question');
    if (!data['cinematography-equipment']) missing.push('Cinematography Equipment');
    if (!data['sound-system']) missing.push('Sound System Selection');
    
    return {
        isValid: missing.length === 0,
        missingFields: missing
    };
}

/**
 * Sanitizes and formats phone numbers
 * @param {string} prefix - Phone prefix
 * @param {string} number - Phone number
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(prefix, number) {
    if (!number) return null;
    return `${prefix}${number}`.trim();
}

/**
 * Prepares data for webhook/API submission
 * @param {Object} rawData - Raw form data from localStorage
 * @returns {Object} Ready-to-send payload
 */
function prepareWebhookPayload(rawData) {
    const structured = structureFormData(rawData);
    const validation = validateCompleteForm(rawData);
    
    return {
        formData: structured,
        validation: validation,
        metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            source: 'Amington Hall Walkthrough Register'
        }
    };
}

// Export functions for use in page scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        structureFormData,
        validateCompleteForm,
        formatPhoneNumber,
        prepareWebhookPayload
    };
}
