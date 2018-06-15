{% capture year_from %}{{ include.job.from | date: '%Y'}}{% endcapture %}
{% capture year_to %}{{ include.job.to | date: '%Y'}}{% endcapture %}
{% if year_from == year_to %}
### {{ include.job.title }}, [{{ include.job.company }}]({{ include.job.url }}), {{ include.job.from | date: '%Y' }}
{% else %}
### {{ include.job.title }}, [{{ include.job.company }}]({{ include.job.url }}), {{ include.job.from | date: '%Y' }}-{{ include.job.to | date: '%Y' }}
{% endif %}
{% for item in include.job.links %}{% include icon-link.html icon=item.icon url=item.url %}{% endfor %}
{% for item in include.job.responsibilities %}
* {{ item.description }}
{% endfor %}