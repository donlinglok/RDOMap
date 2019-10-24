var map;
var markers = [];
var markersLayer = new L.LayerGroup();
var ciLayer = L.canvasIconLayer({});
var ciMarkers = [];

var heatmapLayer;


var searchTerms = [];
var visibleMarkers = [];

var categories = [
    'boats', 'campfires', 'plants', 'hideouts'
];
var subCategories = [
    'alaskan_ginseng', 'american_ginseng', 'bay_bolete', 'black_berry', 'black_currant', 'burdock_root', 'chanterelle',
    'common_bullbrush', 'creeping_thyme', 'english_mace', 'evergreen_huckleberry', 'golden_currant', 'hummingbird_sage',
    'milkweed', 'parasol_mushroom', 'oleander_sage', 'oregano', 'prairie_poppy', 'raspberry', 'rams_head', 'red_sage',
    'indian_tobacco', 'vanilla_flower', 'violet_snowdrop', 'wild_feverfew', 'wild_mint', 'wintergreen_berry', 'yarrow'
];
var enabledTypes = categories;

var categoryButtons = document.getElementsByClassName("menu-option clickable");

var showCoordinates = false;

var avaliableLanguages = ['en-us', 'pt-br'];
var lang;
var languageData = [];

var nocache = 20;


function init()
{
    enabledTypes.splice.apply(enabledTypes, [2, 0].concat(subCategories));

    if(typeof Cookies.get('map-layer') === 'undefined')
        Cookies.set('map-layer', 'Detailed', { expires: 999 });

    if(typeof Cookies.get('language') === 'undefined')
    {
        if(avaliableLanguages.includes(navigator.language.toLowerCase()))
            Cookies.set('language', navigator.language.toLowerCase());
        else
            Cookies.set('language', 'en-us');
    }

    if(!avaliableLanguages.includes(Cookies.get('language')))
        Cookies.set('language', 'en-us');


    lang = Cookies.get('language');
    $("#language").val(lang);

    Language.load();
    Map.init();

    setMapBackground(Cookies.get('map-layer'));
}

function setMapBackground(mapName){
    switch(mapName) {
        default:
        case 'Default':
            $('#map').css('background-color', '#d2b790');
            break;

        case 'Detailed':
            $('#map').css('background-color', '#d2b790');
            break;

        case 'Dark':
            $('#map').css('background-color', '#3d3d3d');
            break;
    }

    Cookies.set('map-layer', mapName, { expires: 999 });
}
function setCurrentDayCycle()
{
    //day1: 2 4 6
    //day2: 0 3
    //day3: 1 5

    var weekDay = new Date().getUTCDay();
    switch(weekDay)
    {
        case 2: //tuesday
        case 4: //thursday
        case 6: //saturday
            day = 1;
            break;

        case 0: //sunday
        case 3: //wednesday
            day = 2;
            break;

        case 1: //monday
        case 5: //friday
            day = 3;
            break;
    }

    $('#day').val(day);

    //Cookie day not exists? create
    if(typeof Cookies.get('date') === 'undefined')
    {
        Cookies.set('date', date, { expires: 2 });
    }
    //if exists, remove markers if the days arent the same
    else
    {
        if(Cookies.get('date') != date.toString())
        {
            Cookies.set('date', date, { expires: 2 });
            if(resetMarkersDaily)
            {
                Cookies.set('removed-items', '', {expires: 1});
                disableMarkers = [];
            }
        }
    }
}

function changeCursor()
{
    if(showCoordinates)
        $('.leaflet-grab').css('cursor', 'pointer!important');
    else
        $('.leaflet-grab').css('cursor', 'grab');
}


$("#search").on("input", function()
{
    searchTerms = [];
    $.each($('#search').val().split(';'), function(key, value)
    {
        if($.inArray(value.trim(), searchTerms) == -1)
        {
            if(value.length > 0)
                searchTerms.push(value.trim());
        }
    });
    Map.addMarkers();
});

$('#show-coordinates').on('change', function()
{
    showCoordinates = $('#show-coordinates').val() == '1';
    changeCursor();
});

$("#language").on("change", function()
{
    lang = $("#language").val();
    Cookies.set('language', lang);
    Language.load(true);
});

$('.menu-option.clickable').on('click', function ()
{
    var menu = $(this);
    menu.children('span').toggleClass('disabled');

    if(menu.children('span').hasClass('disabled'))
    {
        enabledTypes = $.grep(enabledTypes, function(value) {
            return value != menu.data('type');
        });
    }
    else
    {
        enabledTypes.push(menu.data('type'));
    }
    Map.addMarkers();
});

$('.menu-option.animal-clickable').on('click', function ()
{
    var menu = $(this);
    $('.menu-option.animal-clickable').each(function (key, value)
    {
        if(menu.data('type') != $(value).data('type'))
            $(value).children('span').addClass('disabled');
    });

    menu.children('span').toggleClass('disabled');
    if(menu.children('span').hasClass('disabled'))
    {
        Map.removeHeatmap();
    }
    else
    {
        Map.setHeatmap(menu.data('type'));
    }
});

$('.open-submenu').on('click', function(e) {
    e.stopPropagation();
    $(this).parent().parent().children('.menu-hidden').toggleClass('opened');
});

$(document).on('click', '.collectible', function(){
    var collectible = $(this);
    collectible.toggleClass('disabled');

    Map.removeItemFromMap(collectible.data('type'));

});

$('.menu-toggle').on('click', function()
{
    $('.side-menu').toggleClass('menu-opened');

    if($('.side-menu').hasClass('menu-opened'))
    {
        $('.menu-toggle').text('X');
    }
    else
    {
        $('.menu-toggle').text('>');
    }
    $('.timer-container').toggleClass('timer-menu-opened');
    $('.counter-container').toggleClass('counter-menu-opened');

});

