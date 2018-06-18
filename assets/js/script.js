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
    ctx = document.getElementById('canvas').getContext('2d');
    document.ctx = ctx;
    devicePixelRatio = window.devicePixelRatio || 1,
    backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                        ctx.mozBackingStorePixelRatio ||
                        ctx.msBackingStorePixelRatio ||
                        ctx.oBackingStorePixelRatio ||
                        ctx.backingStorePixelRatio || 1,
    ratio = devicePixelRatio / backingStoreRatio;
    if (devicePixelRatio !== backingStoreRatio) {
        var oldWidth = canvas.width;
        var oldHeight = canvas.height;
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        ctx.scale(ratio, ratio);
    }
    ctx.globalAlpha = 0.5;
    ctx.lineWidth=3;
    document.ctx = ctx;
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
            ctx = document.ctx;
            ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
            grd = ctx.createRadialGradient(document.skillorigin.x,document.skillorigin.y,5,document.skillorigin.x,document.skillorigin.y,100);
            grd.addColorStop(0,"white");
            grd.addColorStop(1,"#DDEECC");
            ctx.fillStyle = grd;
            ctx.strokeStyle="#AABBCC";
            ctx.beginPath();
            ctx.arc(document.skillorigin.x,document.skillorigin.y,50,0,2*Math.PI);
            ctx.fill();
            ctx.stroke();
            document.ctx = ctx;
            var $skill_anchors = $('[data-skill="' + $(this).data('skill') + '"]:visible');
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
                ctx = document.ctx;
                ctx.beginPath();
                ctx.arc(document.endpoint.x,document.endpoint.y,50,0,2*Math.PI);
                grd = ctx.createRadialGradient(document.endpoint.x,document.endpoint.y,5,document.endpoint.x,document.endpoint.y,100);
                grd.addColorStop(0,"white");
                grd.addColorStop(1,"#DDEECC");
                ctx.fillStyle = grd;
                ctx.strokeStyle="#AABBCC";
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(
                   document.skillorigin.x,
                   document.skillorigin.y
                );

                ctx.lineTo(
                    document.endpoint.x,
                    document.endpoint.y
                );
                ctx.strokeStyle="#AABBCC";
                ctx.stroke();
            });
        });

        $(this).on('click',function() {
            ctx = document.ctx;
            ctx.globalAlpha = 0.5;
            ctx.font = "900 20pt Tajawal";
            ctx.fillStyle = "black";
            ctx.strokeStyle = "white";
            ctx.textAlign = "center";
            $(this).css('visibility','hidden');
            for (i=1; i<=5; i++) {
                ctx.lineWidth = i;
                ctx.strokeText($(this).text().trim(),document.skillorigin.x,document.skillorigin.y+10);
            }
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.95;
            ctx.fillText($(this).text().trim(),document.skillorigin.x,document.skillorigin.y+10);
            document.ctx = ctx;
            $('canvas').css('pointer-events', 'auto');
            $('canvas').on('click', function() {
                $('[data-skill]').css('visibility','visible');
                ctx = document.ctx;
                ctx.globalAlpha = 0.5;
                ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
                document.ctx = ctx;
                $(this).css('pointer-events', 'none');
                $(this).off('click');
            });
        })
    });
});