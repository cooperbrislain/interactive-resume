> {% for item in include.items %}
>   {% if item.enabled %}
> * {{ item.title }}  
>   {% endif %}
> {% endfor %}