### {{ include.job.title }}, {{ include.job.company }}; {{ include.job.location}} • {{ include.job.from }}-{{ include.job.to }}
{% for item in include.job.responsibilities %}
* {{ item.description }}
{% endfor %}