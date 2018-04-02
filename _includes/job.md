{% if include.job.from == include.job.to %}
### {{ include.job.title }}, {{ include.job.company }}, {{ include.job.from }}
{% else %}
### {{ include.job.title }}, {{ include.job.company }}, {{ include.job.from }}-{{ include.job.to }}
{% endif %}
{% for item in include.job.responsibilities %}
* {{ item.description }}
{% endfor %}