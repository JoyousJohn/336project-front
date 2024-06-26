let uuid

$(document).ready(function() {

    const listingData = getExampleListingData()

    uuid = new URLSearchParams(window.location.search).get('uuid'); // SQL primary key for the auction data
    // const listingData = getItemData(uuid) // uncomment this once getItemData() is implemented

    $('.listing-title').text(listingData['title'])
    $('.listing-description').text(listingData['description'])

    $('.winning-price').text('US $' + listingData['winningPrice'])

    console.log(listingData)

    if (listingData['reserve'] > listingData['winningPrice']) {
        $('.reserve-not-met').show();
    }

    $('.bids-count').text(listingData['bids'].length + ' bids')
    $('.ends-in').text('Ends in ' + listingData['endsIn'])

    $('.listing-condition').text(listingData['condition'])
    $('.listing-category').text(listingData['category'])
    $('.listing-seller').text(listingData['seller']).attr('href', 'user.html?user=' + listingData['seller'])

    for (let i = 0; i < listingData['imageCount']; i++) {

       const $galleryImg = $(`<div class="gallery-img"></div>`)

       $galleryImg.css('background-image', `url('https://picsum.photos/500/550?${i}')`)

       $('.img-gallery').append($galleryImg)

    }

    listingData['bids'].forEach(bid => {

        const $bidElm = $(`
        <a href="/user.html?user=${bid.bidder}">${bid.bidder}</a>
        <div>$${bid.maxBid}</div>
        <div>${bid.bidTimeString}</div>
        `)

        $('.bid-breakdown').append($bidElm)

    })

    const $startPriceElm = $(`
        <div>Start Price</div>
        <div>$${listingData.startPrice}</div>
        <div>${listingData.startTime}</div>
    `)

    $('.bid-breakdown').append($startPriceElm)

    addAVew()

    $('.bid-price-input').val('')

    $('input').on('input', function(event) {
        let currentValue = $(this).val();
    
        if (!currentValue.startsWith('$')) {
            currentValue = '$' + currentValue;
        }
    
        const numericRegex = /^\$?\d*\.?\d{0,2}$/;
        if (numericRegex.test(currentValue)) {
            $(this).val(currentValue);
        } else {
            const prevValue = $(this).data('prevValue') || '';
            $(this).val(prevValue);
        }
        $(this).data('prevValue', $(this).val());

        $('.missing-inputs').addClass('none')

    });

    $('.set-alert').click(function() {
        const hasAlertSet = $(this).hasClass('is-alert')

        if (!hasAlertSet) {
            $(this).addClass('is-alert').text('Alert Active')
            updateAlert(true)
        } else {
            $(this).removeClass('is-alert').text('Create Alert')
            updateAlert(false)
        }

    })

})

// Update the status for if the user has an alert for this item in the user data table
// If alertActive is false you can just delete the uuid from that array
function updateAlert(alertActive) {

    
     
}

// Get auction info from the auction table in SQL via JSP via uuid primary key
function getItemData(uuid) {

    $.ajax({
        type: 'GET',
        url: 'get_auction_info', // change this as you wish
        success: function(response) {
            return response.data;
        },
        error: function(xhr, status, error) {
            console.error('Error getting auction data:', error);
        }
    });

}

// Add +1 view to the item in the auctions table with input uuid
function addAVew(uuid) {

    $.ajax({
        type: 'POST',
        url: 'add_view', // change this as you wish
        data: JSON.stringify(uuid),
        contentType: 'application/json',
    });

}

function placeBid() {

    const bidAmount = $('.bid-price-input').val()

    // Confirm inputs aren't blank
    if (bidAmount === '' || bidAmount === '$') {
        $('.missing-inputs').removeClass('none')
        return
    }

    const bidInfo = {
        'bidAmount': bidAmount,
    }

    postBid(bidAmount)

}

// Make a post request to some endpoint to add the new bid!
// bidInfo is guaranteed to have 2 keys: 'bidAmount' and the 'uuid' of the current item
// Add the bid to the bids attribute of the item in the auction table with uuid primary key!
function postBid(bidInfo) {

    bidInfo['uuid'] = uuid

    $.ajax({
        type: 'POST',
        url: 'post_bid', // change this as you wish
        data: JSON.stringify(bidInfo),
        contentType: 'application/json',
        success: function(response) {
            // Eventually do visual stuff to show the user their bid was made
        },
        // An error could occur if the auction has ended
        error: function(error) {
            // Tell the user there was an error
        }
    });

}

function getExampleListingData() {

    return {
        'title': 'Vintage Running Shoe',
        'winningPrice': 24.73,
        'reserve': 28.00,
        'endsIn': '12h 18m 4s',
        'condition': 'Used',
        'imageCount': 6,
        'category': 'Running',
        'startPrice': 8.53,
        'startTime': 'May 2, 2024, 4:28 AM',
        'seller': 'randomorange123',

        'description': `Step back in time with these classic vintage running shoes! These retro kicks boast timeless style and are perfect for sneakerheads and collectors alike. Crafted with quality materials and featuring a comfortable design, they're not just a fashion statement but a piece of history. Whether you're hitting the pavement or adding to your collection, these sneakers are sure to turn heads. Don't miss out on owning a piece of nostalgia - bid now!`,

        'bids': [
            {
                'bidder': 'waterbottle',
                'maxBid': 24.73,
                'bidTimeString': 'May 4, 2024, 3:41 PM'
            },
            {
                'bidder': 'middleman',
                'maxBid': 18.54,
                'bidTimeString': 'May 4, 2024, 1:00 PM'
            },
            {
                'bidder': 'tidepodfun',
                'maxBid': 10.12,
                'bidTimeString': 'May 3, 2024, 7:38 AM'
            }
        ]
    }

}