String.prototype.toKebabCase = function() {
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
        x: $from.offset().left+$from.outerWidth()/2,
        y: $from.offset().top+$from.outerHeight()/2
    };
    console.log('fromAnchor', fromAnchor);

    // from bubble
    ctx.beginPath();
    ctx.strokeStyle = "#4be500";
    ctx.arc(fromAnchor.x,fromAnchor.y,fromRadius,0,2*Math.PI);
    ctx.innerGlow(10);

    document.ctx = ctx;
    document.$selected = $from;
    console.log('From', $from);
    console.log('To', $to);
    // to loop
    $to.each(function() {
        const $this = $(this);
        let toAnchor, toRadius;

        if ($this === $from[0]) {
            return 0;
        }

        if ($this.is('.job .skills li')) {
            console.log('job skills li');
            const $sectionHeading = $this.parent().parent().find('h3');
            console.log('element: ', $sectionHeading);
            toAnchor = {
                x: $sectionHeading.offset().left-15,
                y: $sectionHeading.offset().top+$sectionHeading.outerHeight()/2
            };
            console.log('toAnchor', toAnchor);
            toRadius = 15;
        } else {
            console.log('else');
            toAnchor = {
                x: $this.offset().left+$this.outerWidth()/2,
                y: $this.offset().top+$this.outerHeight()/2
            };
            toRadius = 50;
        }

        console.log(fromAnchor, toAnchor);

        // calculate angle
        const angle = Math.atan2(
            toAnchor.y-fromAnchor.y,
            toAnchor.x-fromAnchor.x
        );
        // console.log(angle);

        // calculate segment between
        const lineOrigin = {
            'x': fromAnchor.x+Math.cos(angle)*fromRadius,
            'y': fromAnchor.y+Math.sin(angle)*fromRadius
        };
        // console.log('Origin', lineOrigin);

        const lineEnd = {
            'x': toAnchor.x-Math.cos(angle)*toRadius,
            'y': toAnchor.y-Math.sin(angle)*toRadius
        };
        // console.log('End', lineEnd);

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
    $('[data-json]').each(function () {
        $(this).data($(this).data('json'));
        $(this).removeAttr('json');
        $(this).removeData('json');
    });
    $('strong').each(function(index) {
        let skillName = $(this).text();
        skillName = skillName.toKebabCase();
        $(this).attr('data-skill',skillName);
        $(this).data('skill',skillName);
    });
    $('#technical-skills+ul li[data-skill]').each(function() {
        if($(this).data('slug')) {
            $(this).attr('data-skill',$(this).data('slug'));
            $(this).data('skill',$(this).data('slug'));
        }
        if($(this).data('synonyms')) {
            document.curSkill = $(this).data('skill');
            $.each($(this).data('synonyms'), function(index, value) {
                const $items = $(`strong[data-skill="${value}"`);
                $items.attr('data-skill', document.curSkill);
                $items.data('skill', document.curSkill);

            });
        }
    });

    // set up canvas
    $('<canvas id="canvas">').appendTo('body'); // todo: change this to append before scripts?
    const canvas = document.getElementById('canvas');
    // set width and height to the entire page (as opposed to the window)
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
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

    $(document).on('click', "#technical-skills+ul>li, strong[data-skill]", e => {
        $this = $(e.target);
        document.$selected = $this;
        document.fromAnchor = {
            x: $this.offset().left+$this.outerWidth()/2,
            y: $this.offset().top+$this.outerHeight()/2
        };
        const $skillAnchors = $(`[data-skill="${document.$selected.data('skill')}"]`);
        const $job = $('.job');
        const $canvas = $('canvas');
        $job.not($job.has(`[data-skill="${document.$selected.data('skill')}"]`)).fadeOut(() => {
            $canvas.css('pointer-events', 'auto');
            ctx = document.ctx;
            ctx.clearRect(0, 0, $canvas.outerWidth(), $canvas.outerHeight());
            ctx.beginPath();
            document.ctx = ctx;
            console.log(document.$selected);
            connectBubbles(document.$selected, $skillAnchors);
            ctx = document.ctx;
            ctx.font = "900 14pt Tajawal";
            ctx.fillStyle = "black";
            ctx.strokeStyle = "white";
            ctx.textAlign = "center";
            ctx.eclipseText(document.$selected.text().trim(), document.fromAnchor.x, document.fromAnchor.y, 15);
            document.$selected.css('visibility','hidden');
            document.ctx = ctx;
        });
    });

    $('canvas').on('click', e => {
        const $canvas = $('canvas');
        const $this = $(e.target);

        $('[data-skill]').css('visibility','visible');
        ctx = document.ctx;
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, $canvas.outerWidth(), $canvas.outerHeight());
        document.ctx = ctx;
        e.preventDefault();
        $this.css('pointer-events', 'none');
        $this.off('click');
        $('.job').fadeIn();
    });

    $(document).on('click',"#technical-skills+ul>li, strong[data-skill]", (e) => {
        $this = $(e.target);
        document.$selected = $this;
        document.fromAnchor = {
            x: $this.offset().left+$this.outerWidth()/2,
            y: $this.offset().top+$this.outerHeight()/2
        };
        const $skillAnchors = $(`[data-skill="${document.$selected.data('skill')}"]`);
        // fade out other skills.
        $('.job').not($('.job').has(`[data-skill="${document.$selected.data('skill')}"]`)).fadeOut(() => {
            $('canvas').css('pointer-events', 'auto');
            ctx = document.ctx;
            ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
            ctx.beginPath();
            document.ctx = ctx;
            connectBubbles(document.$selected, $skillAnchors);
            ctx = document.ctx;
            ctx.font = "900 14pt Tajawal";
            ctx.fillStyle = "black";
            ctx.strokeStyle = "white";
            ctx.textAlign = "center";
            ctx.eclipseText(document.$selected.text().trim(),
                document.fromAnchor.x,
                document.fromAnchor.y, 15);
            document.$selected.css('visibility','hidden');
            document.ctx = ctx;
        });

        $('canvas').on('click', e => {
            $this = $(e.target);
            $('[data-skill]').css('visibility','visible');
            ctx = document.ctx;
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, $('canvas').outerWidth(), $('canvas').outerHeight());
            document.ctx = ctx;
            e.preventDefault();
            $this.css('pointer-events', 'none');
            $this.off('click');
            $('.job').fadeIn();
        });
    });

    $('.btn-grip').on('click', () => { $('#nav .panel').slideToggle() });

    $(document).on('scroll', () => { $('#nav .panel').slideUp(); });
});