const editInputs = document.querySelectorAll('input');

for (let input of editInputs) {
  if (parseInt(input.value) === rating) {
    input.checked = true;
  }
}
