> {% for item in include.items %}
> {% if item.enabled %}
> {% if item.url %}
> * [{{ item.title }}]({{ item.url }})  
> {% else %}
> * {{ item.title }} 
> {% endif %}
> {% endif %}
> {% endfor %}