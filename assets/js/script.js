function sp(str) {
    // convert to spinal case
    var spinal = str.replace(/(?!^)([A-Z])/g, '$1')
        .replace(/[_\s]+(?=[a-zA-Z])/g, '-').toLowerCase()
        .replace(/^(-+)/g, '')
        .trim();
    return spinal;
}

function connectBubbles($from, $to, from_rad=50, to_rad=50, small_rad=15) {
    ctx = document.ctx;

    fromanchor = {
        x: $from.offset().left+$from.outerWidth()/2,
        y: $from.offset().top+$from.outerHeight()/2
    }
    // from bubble
    ctx.beginPath();
    ctx.strokeStyle = "#00ef60";
    ctx.arc(fromanchor.x,fromanchor.y,from_rad,0,2*Math.PI);
    ctx.innerGlow(18);

    document.ctx = ctx;
    document.$selected = $from;

    // to loop
    $to.each(function() {
        $from = document.$selected;
        fromanchor = {
            x: $from.offset().left+$from.outerWidth()/2,
            y: $from.offset().top+$from.outerHeight()/2
        }
        if ($(this)[0] == $from[0]) {
            return 0;
        }
        if ($(this).is('.job .skills li')) {
            toanchor = {
                x: $(this).parent().parent().find('h3').offset().left-15,
                y: $(this).parent().parent().find('h3').offset().top+$(this).parent().parent().find('h3').outerHeight()/2
            }
            to_rad = 15;
        } else {
            toanchor = {
                x: $(this).offset().left+$(this).outerWidth()/2,
                y: $(this).offset().top+$(this).outerHeight()/2
            }
            to_rad = 50;
        }

        // calculate angle
        ang = Math.atan2(
            toanchor.y-fromanchor.y,
            toanchor.x-fromanchor.x
        );
        // calculate segment between
        lineorigin = {
            'x': fromanchor.x+Math.cos(ang)*from_rad,
            'y': fromanchor.y+Math.sin(ang)*from_rad
        }
        lineend = {
            'x': toanchor.x-Math.cos(ang)*to_rad,
            'y': toanchor.y-Math.sin(ang)*to_rad
        }

        ctx = document.ctx;

        // draw line
        ctx.beginPath();
        ctx.strokeStyle="#02acf3";
        ctx.lineWidth = 3;
        ctx.moveTo(
           lineorigin.x,
           lineorigin.y
        );
        ctx.lineTo(
            lineend.x,
            lineend.y
        );
        ctx.stroke();

        // glow target
        ctx.beginPath();
        ctx.arc(toanchor.x,toanchor.y,to_rad,0,2*Math.PI);
        ctx.strokeStyle="#02acf3";
        ctx.innerGlow(20);

        document.ctx = ctx;
    })
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
        this.strokeText(text, x, y+7);
    }
    this.globalAlpha = 1;
    ctx.fillText(text, x, y+7);

    this.restore();
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
            document.$selected = $(this);
            ctx = document.ctx;
            ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
            ctx.strokeStyle="#DEFAC9";
            document.ctx = ctx;
            $skill_anchors = $('[data-skill="' + $(this).data('skill') + '"]');
            connectBubbles($(this), $skill_anchors);
        });

        $(this).on('click',function() {
            document.$selected = $(this);
            document.fromanchor = {
                x: $(this).offset().left+$(this).outerWidth()/2,
                y: $(this).offset().top+$(this).outerHeight()/2
            };
            $skill_anchors = $('[data-skill="' + document.$selected.data('skill') + '"]');
            $('.job').not($('.job').has('[data-skill="' + document.$selected.data('skill') + '"]')).slideUp(function() {
                $('canvas').css('pointer-events', 'auto');
                ctx = document.ctx;
                ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
                ctx.beginPath();
                document.ctx = ctx;
                connectBubbles(document.$selected, $skill_anchors);
                ctx = document.ctx;
                ctx.font = "900 18pt Tajawal";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white";
                ctx.textAlign = "center";
                ctx.eclipseText(document.$selected.text().trim(), document.fromanchor.x, document.fromanchor.y, 15);
                document.$selected.css('visibility','hidden');
                document.ctx = ctx;
            });
            $('canvas').on('click', function() {
                $('[data-skill]').css('visibility','visible');
                $('.job').slideDown();
                ctx = document.ctx;
                ctx.globalAlpha = 1;
                ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
                document.ctx = ctx;
                event.stopPropagation();
                $(this).css('pointer-events', 'none');
                $(this).off('click');
            });
        })
    });
});