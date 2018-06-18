function sp(str) {
    // convert to spinal case
    var spinal = str.replace(/(?!^)([A-Z])/g, '$1')
        .replace(/[_\s]+(?=[a-zA-Z])/g, '-').toLowerCase()
        .replace(/^(-+)/g, '')
        .trim();
    return spinal;
}

$(document).ready(function() {
    $('<canvas id="canvas">').appendTo('body');
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = $(document).height();
    context = document.getElementById('canvas').getContext('2d');
    document.context = context;
    devicePixelRatio = window.devicePixelRatio || 1,
    backingStoreRatio = context.webkitBackingStorePixelRatio ||
                        context.mozBackingStorePixelRatio ||
                        context.msBackingStorePixelRatio ||
                        context.oBackingStorePixelRatio ||
                        context.backingStorePixelRatio || 1,
    ratio = devicePixelRatio / backingStoreRatio;
    if (devicePixelRatio !== backingStoreRatio) {
        var oldWidth = canvas.width;
        var oldHeight = canvas.height;
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        context.scale(ratio, ratio);
    }
    context.globalAlpha = 0.5;
    context.lineWidth=3;
    document.context = context;
    $('strong').each(function(index) {
        var skillname = sp($(this).text());
        $(this).attr('data-skill',skillname);
    });

    var $skills = $('#technical-skills+ul>li');
    $skills.each(function(index) {
        var skillname = sp($(this).text());
        $(this).attr('data-skill',skillname);
        $(this).on('mouseenter', function() {
            $('.highlight').remove();
            document.skillorigin = {
                'x': $(this).offset().left+$(this).outerWidth()/2,
                'y': $(this).offset().top+$(this).outerHeight()/2
                };
            context = document.context;
            context.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
            grd = context.createRadialGradient(document.skillorigin.x,document.skillorigin.y,5,document.skillorigin.x,document.skillorigin.y,100);
            grd.addColorStop(0,"white");
            grd.addColorStop(1,"#DDEECC");
            context.fillStyle = grd;
            context.strokeStyle="#AABBCC";
            context.beginPath();
            context.arc(document.skillorigin.x,document.skillorigin.y,50,0,2*Math.PI);
            context.fill();
            context.stroke();
            document.context = context;
            var $skill_anchors = $('[data-skill="' + $(this).data('skill') + '"]');
            $skill_anchors.each(function(index) {
                $highlight = $('<div>')
                    .addClass('highlight')
                    .css('width', $(this).width()+10)
                    .css('height', $(this).height()+10)
                    .css('top', $(this).position().top-5)
                    .css('left', $(this).position().left-5)
                    .css('z-index',101);
                $highlight.insertAfter($(this));
                document.endpoint = {
                    'x': $(this).offset().left+$(this).outerWidth()/2,
                    'y': $(this).offset().top+$(this).outerHeight()/2
                };
                context = document.context;
                context.beginPath();
                context.arc(document.endpoint.x,document.endpoint.y,50,0,2*Math.PI);
                grd = context.createRadialGradient(document.endpoint.x,document.endpoint.y,5,document.endpoint.x,document.endpoint.y,100);
                grd.addColorStop(0,"white");
                grd.addColorStop(1,"#DDEECC");
                context.fillStyle = grd;
                context.strokeStyle="#AABBCC";
                context.fill();
                context.stroke();
                context.beginPath();
                context.moveTo(
                   document.skillorigin.x,
                   document.skillorigin.y
                );

                context.lineTo(
                    document.endpoint.x,
                    document.endpoint.y
                );
                context.strokeStyle="#AABBCC";
                context.stroke();
            });
        });
    });
});