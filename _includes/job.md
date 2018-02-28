### {{ job.title }}, {{ job.company }}; {{job.location}} • {{ job.from }}-{{job.to}}
{% for item in job.responsibilities %}
- {{ item.description }}
{% endfor %}