{% assign _issues = include.issues | split: "," %}
{% for _issue in _issues %}
[#{{_issue}}]: https://github.com/dpowcore-project/dpowcoin/issues/{{_issue}}
{% endfor %}
