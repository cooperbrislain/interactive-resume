function sp(str) {
    // convert to spinal case
    var spinal = str.replace(/(?!^)([A-Z])/g, '$1')
        .replace(/[_\s]+(?=[a-zA-Z])/g, '-').toLowerCase()
        .replace(/^(-+)/g, '')
        .trim();
    return spinal;
}

CanvasRenderingContext2D.prototype.innerGlow = function(iters) {
    this.save();
    this.globalAlpha = 0.08;
    this.clip();
    for (i=1; i<=iters; i++) {
        this.lineWidth = i;
        this.stroke();
    }
    this.restore();
}

CanvasRenderingContext2D.prototype.eclipseText = function(text, x, y, iters) {
    this.save();
    this.globalAlpha = 0.12;
    for (i=1; i<=iters; i++) {
        this.lineWidth = i;
        this.strokeText(text, x, y);
    }
    this.restore();
    ctx.fillText(text, x, y);
}

$(document).ready(function() {
    $('<canvas id="canvas">').appendTo('body');
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = $(document).height();
    ctx = document.getElementById('canvas').getContext('2d');
    console.log(ctx);
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
            ctx.save();
            grd = ctx.createRadialGradient(document.skillorigin.x,document.skillorigin.y,5,document.skillorigin.x,document.skillorigin.y,100);
            grd.addColorStop(0,"white");
            grd.addColorStop(1,"#DDEECC");
            ctx.strokeStyle="#DEFAC9";
            ctx.beginPath();
            ctx.arc(document.skillorigin.x,document.skillorigin.y,50,0,2*Math.PI);
            ctx.innerGlow(25);
            document.ctx = ctx;
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

                startrad = 50;
                if ($(this).is('.job .skills li')) {
                    $anchor = $(this).parent().parent().find('h3');
                    document.endpoint = {
                        'x': $anchor.offset().left-25,
                        'y': $anchor.offset().top+$anchor.outerHeight()/2
                    }
                    endrad = 10;
                } else {
                    document.endpoint = {
                        'x': $(this).offset().left+$(this).outerWidth()/2,
                        'y': $(this).offset().top+$(this).outerHeight()/2
                    };
                    endrad = 50;
                }
                ctx = document.ctx;
                ctx.beginPath();
                ctx.arc(document.endpoint.x,document.endpoint.y,endrad,0,2*Math.PI);
                ctx.strokeStyle="#AABBCC";
                ctx.innerGlow(15);
                ang = Math.atan2(
                                 document.endpoint.y-document.skillorigin.y,
                                 document.endpoint.x-document.skillorigin.x
                                 );
                lineorigin = {
                    'x': document.skillorigin.x+Math.cos(ang)*startrad,
                    'y': document.skillorigin.y+Math.sin(ang)*startrad
                }
                lineend = {
                    'x': document.endpoint.x-Math.cos(ang)*endrad,
                    'y': document.endpoint.y-Math.sin(ang)*endrad
                }

                ctx.beginPath();
                ctx.moveTo(
                   lineorigin.x,
                   lineorigin.y
                );
                ctx.lineTo(
                    lineend.x,
                    lineend.y
                );

                ctx.strokeStyle = "#AABBCC";
                ctx.lineWidth = 3;
                if (Math.abs(document.skillorigin.x - document.endpoint.x) > 1
                    && Math.abs(document.skillorigin.y - document.endpoint.y) > 1) {
                        ctx.stroke();
                }
            });
        });

        $(this).on('click',function() {
            ctx = document.ctx;
            ctx.beginPath();
            ctx.font = "900 20pt Tajawal";
            ctx.fillStyle = "black";
            ctx.strokeStyle = "white";
            ctx.globalAlpha = 1;
            ctx.textAlign = "center";
            ctx.eclipseText($(this).text().trim(), document.skillorigin.x, document.skillorigin.y+10, 15);
            document.ctx = ctx;
            $(this).css('visibility','hidden');
            $('canvas').css('pointer-events', 'auto');
            $('canvas').on('click', function() {
                $('[data-skill]').css('visibility','visible');
                ctx = document.ctx;
                ctx.globalAlpha = 1;
                ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
                document.ctx = ctx;
                $(this).css('pointer-events', 'none');
                $(this).off('click');
            });
        })
    });
});