String.prototype.toKebabCase = function() {
    return this.replace(/(?!^)([A-Z])/g, '$1')
        .replace(/[_\s]+(?=[a-zA-Z])/g, '-').toLowerCase()
        .replace(/^(-+)/g, '')
        .trim();
};

Math.lerp = (value1, value2, amount) => {
    let amount_ = amount < 0 ? 0 : amount;
    amount_ = amount > 1 ? 1 : amount;
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

    $to.each(function() {
        const $this = $(this);
        let toAnchor, toRadius;
        console.log($this, $from);
        if ($this === $from) { return 0; }

        if ($this.is('.job .skills li')) {
            const $sectionHeading = $this.parent().parent().find('h3');
            console.log($this, $sectionHeading);
            toAnchor = {
                x: $sectionHeading.offset().left-15,
                y: $sectionHeading.offset().top+$sectionHeading.outerHeight()/2
            };
            toRadius = 15;
        } else {
            console.log($this);
            toAnchor = {
                x: $this.offset().left+$this.outerWidth()/2,
                y: $this.offset().top+$this.outerHeight()/2
            };
            toRadius = 50;
        }

        // calculate angle
        const angle = Math.atan2(
            toAnchor.y-fromAnchor.y,
            toAnchor.x-fromAnchor.x
        );

        // calculate segment between
        const lineStart = {
            'x': fromAnchor.x+Math.cos(angle)*fromRadius,
            'y': fromAnchor.y+Math.sin(angle)*fromRadius
        };

        const lineEnd = {
            'x': toAnchor.x-Math.cos(angle)*toRadius,
            'y': toAnchor.y-Math.sin(angle)*toRadius
        };

        document.ctx = drawLine(document.ctx, lineStart, lineEnd);
    });
};

const drawLine = (ctx, lineStart, lineEnd) => {
    ctx.strokeStyle = "#02acf3";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;

    ctx.beginPath();
    ctx.moveTo(lineStart.x, lineStart.y);
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();

    return ctx;
};

const drawCircle = (ctx, center, radius) => {
    ctx.strokeStyle="#32ccf3";

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
    ctx.innerGlow(15);

    return ctx;
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

const writeText = (text, origin= {x: 0, y: 0}) => {
    const ctx = document.ctx;

    ctx.font = "900 14pt Tajawal";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";

    ctx.eclipseText(text, origin.x, origin.y, 15);
    document.$selected.css('visibility','hidden');
    document.ctx = ctx;
    return 0;
};

const buildCanvas = $canvas => {
    const canvas = $canvas.get();
    const ctx = canvas.getContext('2d');

    document.ctx = ctx;
    // set width and height to the entire page (as opposed to the window)
    // todo: convert this vanilla js to jQuery?
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    const ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        ctx.scale(ratio, ratio);
    }
    ctx.globalAlpha = 0.5;
    ctx.lineWidth=3;

    document.ctx = ctx;
};

$(document).ready(function() {

    const $canvas = $('<canvas id="canvas">').appendTo('body');

    // assign data from json tags
    $('[data-json]').each((i, $item) => {
        console.log($item);
        $item.data($item.data('json'));
        $item.removeAttr('json');
        $item.removeData('json');
    });

    // assign data
    $('strong').each((i, $item) => {
        console.log($item);
        const skillName = $item.text().toKebabCase();
        $item.attr('data-skill',skillName);
        $item.data('skill',skillName);
    });

    enhanceTechnicals();

    buildCanvas($canvas);


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
        const $jobs = $('.job');
        const $selectedJob = $jobs.has(`[data-skill="${document.$selected.data('skill')}"]`);
        $jobs.not($selectedJob).fadeOut(() => {
            const $canvas = $('canvas');
            let ctx = document.ctx;
            $canvas.css('pointer-events', 'auto');

            ctx.clearRect(0, 0, $canvas.outerWidth(), $canvas.outerHeight());

            connectBubbles(document.$selected, $skillAnchors);
            const text = document.$selected.text().trim();
            writeText(text);
        });

        $('canvas').on('click', e => {
            const $this = $(e.target);
            const $canvas = $('canvas');

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
    });

    $('.btn-grip').on('click', () => { $('#nav .panel').slideToggle() });

    $(document).on('scroll', () => { $('#nav .panel').slideUp(); });
});

const enhanceTechnicals = () => {
    $('#technical-skills+ul li[data-skill]').each(function() {
        const $this = $(this);
        if($this.data('slug')) {
            $this.attr('data-skill',$this.data('slug'));
            $this.data('skill',$this.data('slug'));
        }
        if($this.data('synonyms')) {
            document.curSkill = $this.data('skill');
            const synonyms = $this.data('synonyms');
            $.each(synonyms, function(i, skill) {
                const $items = $(`strong[data-skill="${skill}"`);
                $items.attr('data-skill', document.curSkill);
                $items.data('skill', document.curSkill);
            });
        }
    });
};