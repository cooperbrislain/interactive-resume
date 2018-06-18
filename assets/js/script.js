function sp(str) {
    // convert to spinal case
    var spinal = str.replace(/(?!^)([A-Z])/g, '$1')
        .replace(/[_\s]+(?=[a-zA-Z])/g, '-').toLowerCase()
        .replace(/^(-+)/g, '');
    return spinal
}

$(document).ready(function() {
    var $skills = $('#technical-skills+ul>li');
    $skills.each(function(index) {
        console.log(this);
        $(this).on('click', function() {
            console.log(sp($(this).text()));
            var $skill_anchors = $('div.job>ul.skills>li[data-skill="' + sp($(this).text()) + '"]');
            $('.job').removeClass('highlight');
            $skill_anchors.each(function(index) {
                $(this).parent().parent().addClass('highlight');
            });
        });
    });
});