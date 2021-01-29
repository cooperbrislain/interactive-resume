String.prototype.toSpinalCase = function() {
    return this.replace(/(?!^)([A-Z])/g, '$1')
        .replace(/[_\s]+(?=[a-zA-Z])/g, '-').toLowerCase()
        .replace(/^(-+)/g, '')
        .trim();
};

Math.lerp = (value1, value2, amount) => {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
};

connectBubbles = function($from, $to, fromRadius=50, toRadius=50, smallRadius=15) {
    let ctx = document.ctx;
    const fromAnchor = {
        x: $from.left+$from.outerWidth()/2,
        y: $from.top+$from.outerHeight()/2
    };
    // from bubble
    ctx.beginPath();
    ctx.strokeStyle = "#4be500";
    ctx.arc(fromAnchor.x,fromAnchor.y,fromRadius,0,2*Math.PI);
    ctx.innerGlow(10);

    document.ctx = ctx;
    document.$selected = $from;

    // to loop
    $to.each((i, $item) => {
        if ($item[0] === $from[0]) {
            return 0;
        }

        let toAnchor, toRadius;

        if ($(this).is('.job .skills li')) {
            toAnchor = {
                x: $(this).parent().parent().find('h3').left-15,
                y: $(this).parent().parent().find('h3').top+$(this).parent().parent().find('h3').outerHeight()/2
            };
            toRadius = 15;
        } else {
            toAnchor = {
                x: $(this).left+$(this).outerWidth()/2,
                y: $(this).top+$(this).outerHeight()/2
            };
            toRadius = 50;
        }

        // calculate angle
        const angle = Math.atan2(
            toAnchor.y-fromAnchor.y,
            toAnchor.x-fromAnchor.x
        );
        // calculate segment between
        const lineOrigin = {
            'x': fromAnchor.x+Math.cos(angle)*fromRadius,
            'y': fromAnchor.y+Math.sin(angle)*fromRadius
        };

        const lineEnd = {
            'x': toAnchor.x-Math.cos(angle)*toRadius,
            'y': toAnchor.y-Math.sin(angle)*toRadius
        };

        ctx = document.ctx;

        // draw line
        ctx.beginPath();
        ctx.strokeStyle = "#02acf3";
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.moveTo(lineOrigin.x, lineOrigin.y);
        ctx.lineTo(lineEnd.x, lineEnd.y);
        ctx.stroke();
        // glow target
        ctx.beginPath();
        ctx.arc(toAnchor.x,toAnchor.y,toRadius,0,2*Math.PI);
        ctx.strokeStyle="#32ccf3";
        ctx.innerGlow(15);
        document.ctx = ctx;
    });
};

CanvasRenderingContext2D.prototype.innerGlow = function(iterations) {
    this.save();
    this.globalAlpha = 0.08;
    this.clip();
    for (let i=1; i<=iterations; i++) {
        this.lineWidth = i;
        this.stroke();
    }
    this.restore();
};

CanvasRenderingContext2D.prototype.eclipseText = function(text, x, y, iterations) {
    this.save();
    this.globalAlpha = 0.12;
    for (let i=1; i<=iterations; i++) {
        this.lineWidth = i;
        this.strokeText(text, x, y+5);
    }
    this.globalAlpha = 1;
    const ctx = document.ctx;
    ctx.fillText(text, x, y+7);
    this.restore();
};

$(document).ready(function() {
    // assign data from json tags
    $('[data-json]').each(() => {
        $(this).data($(this).data('json'));
        $(this).removeAttr('json');
        $(this).removeData('json');
    });
    $('strong').each(function(index) {
        let skillName = $(this).text();
        skillName = skillName.toSpinalCase();
        $(this).attr('data-skill',skillName);
        $(this).data('skill',skillName);
    });
    $('#technical-skills+ul li[data-skill]').each(function() {
        if($(this).data('slug')) {
            $(this).attr('data-skill',$(this).data('slug'));
            $(this).data('skill',$(this).data('slug'));
        }
        if($(this).data('synonyms')) {
            document.skillname = $(this).data('skill');
            $.each($(this).data('synonyms'), function(index, value) {
                const $items = $('strong[data-skill="' + value + '"]');
                $items.attr('data-skill', document.skillname);
                $items.data('skill', document.skillname);

            });
        }
    });

    // set up canvas
    $('<canvas id="canvas">').appendTo('body'); // todo: change this to append before scripts?

    const canvas = document.getElementById('canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    let ctx = document.getElementById('canvas').getContext('2d');
    document.ctx = ctx;
    let devicePixelRatio = window.devicePixelRatio || 1;
    let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                        ctx.mozBackingStorePixelRatio ||
                        ctx.msBackingStorePixelRatio ||
                        ctx.oBackingStorePixelRatio ||
                        ctx.backingStorePixelRatio || 1;
    let ratio = devicePixelRatio / backingStoreRatio;
    if (devicePixelRatio !== backingStoreRatio) {
        let oldWidth = canvas.width;
        let oldHeight = canvas.height;
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        ctx.scale(ratio, ratio);
    }
    ctx.globalAlpha = 0.5;
    ctx.lineWidth=3;
    document.ctx = ctx;

    const $skills = $('#technical-skills+ul>li, strong[data-skill]');
    $skills.each(function(index) {
        let skillName = $(this).data('skill');
        /*$(this).on('mouseenter', function() {
            document.$selected = $(this);
            ctx = document.ctx;
            ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
            ctx.strokeStyle="#DEFAC9";
            document.ctx = ctx;
            $skill_anchors = $('[data-skill="' + $(this).data('skill') + '"]');
            connectBubbles($(this), $skill_anchors);
        });*/

        $(this).on('click',function() {
            document.$selected = $(this);
            document.fromanchor = {
                x: $(this).offset().left+$(this).outerWidth()/2,
                y: $(this).offset().top+$(this).outerHeight()/2
            };
            const $skill_anchors = $('[data-skill="' + document.$selected.data('skill') + '"]');
            // fade out other skills.
            $('.job').not($('.job').has(`[data-skill="${document.$selected.data('skill')}"]`)).fadeOut(() => {
                $('canvas').css('pointer-events', 'auto');
                ctx = document.ctx;
                ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
                ctx.beginPath();
                document.ctx = ctx;
                connectBubbles(document.$selected, $skill_anchors);
                ctx = document.ctx;
                ctx.font = "900 14pt Tajawal";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white";
                ctx.textAlign = "center";
                ctx.eclipseText(document.$selected.text().trim(), document.fromanchor.x, document.fromanchor.y, 15);
                document.$selected.css('visibility','hidden');
                document.ctx = ctx;
            });
            $('canvas').on('click', function(e) {
                $('[data-skill]').css('visibility','visible');
                ctx = document.ctx;
                ctx.globalAlpha = 1;
                ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
                document.ctx = ctx;
                e.preventDefault();
                $(this).css('pointer-events', 'none');
                $(this).off('click');
                $('.job').fadeIn();
            });
        });
    });

    $('.btn-grip').on('click', () => { $('#nav .panel').slideToggle() });

    $(document).on('scroll', () => { $('#nav .panel').slideUp(); });
});