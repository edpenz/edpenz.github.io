
var smoothstatePageConfig = {
  {% for entry in page.smoothstate %}
    {{ entry[0] }}: '{{ entry[1] }}',
  {% endfor %}
}
