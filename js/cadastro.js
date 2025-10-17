class Validator {

  constructor() {
    this.validations = [
      'data-min-length',
      'data-max-length',
      'data-only-letters',
      'data-email-validate',
      'data-required',
      'data-equal',
      'data-password-validate',
    ]
  }

  // Validação de todos os campos
  validate(form) {

    // limpando todas as validações antigas
    let currentValidations = document.querySelectorAll('form .error-validation');

    if(currentValidations.length) {
      this.cleanValidations(currentValidations);
    }

    // Guardar todos os inputs
    let inputs = form.getElementsByTagName('input');
    // Transformando HTMLCollection em array
    let inputsArray = [...inputs];

    // Gerando loop nos inputs e realizando a validação conforme os atributos encontrados
    inputsArray.forEach(function(input, obj) {

      // Realizar a validação de acordo com o atributo do input
      for(let i = 0; this.validations.length > i; i++) {
        if(input.getAttribute(this.validations[i]) != null) {

          // Limpando string para saber o método
          let method = this.validations[i].replace("data-", "").replace("-", "");

          // Valor do input
          let value = input.getAttribute(this.validations[i])

          // Invoca o método
          this[method](input,value);

        }
      }

    }, this);

  }

  // Método para validar se há uma quantidade mínima de caracteres
  minlength(input, minValue) {

    let inputLength = input.value.length;

    let errorMessage = `O campo precisa ter, no mínimo, ${minValue} caracteres`;

    if(inputLength < minValue) {
      this.printMessage(input, errorMessage);
    }

  }

  // Método para validar se houve ultrapassagem do máximo de caracteres
  maxlength(input, maxValue) {

    let inputLength = input.value.length;

    let errorMessage = `O campo precisa ter, no máximo, ${maxValue} caracteres`;

    if(inputLength > maxValue) {
      this.printMessage(input, errorMessage);
    }

  }

  // Método para validar strings que contenham apenas letras
  onlyletters(input) {

    let re = /^[A-Za-z]+$/;;

    let inputValue = input.value;

    let errorMessage = `Este campo não aceita números nem caracteres especiais`;

    if(!re.test(inputValue)) {
      this.printMessage(input, errorMessage);
    }

  }

  // Método para validar e-mail
  emailvalidate(input) {
    let re = /\S+@\S+\.\S+/;

    let email = input.value;

    let errorMessage = `Insira um e-mail válido (ex.: joao@gmail.com)`;

    if(!re.test(email)) {
      this.printMessage(input, errorMessage);
    }

  }

  // Verificando se os campos de senhas são iguais
  equal(input, inputName) {

    let inputToCompare = document.getElementsByName(inputName)[0];

    let errorMessage = `Este campo precisa ser igual ao ${inputName}`;

    if(input.value != inputToCompare.value) {
      this.printMessage(input, errorMessage);
    }
  }
  
  // Método para exibir inputs que são necessários/obrigatórios
  required(input) {

    let inputValue = input.value;

    if(inputValue === '') {
      let errorMessage = `Este campo é obrigatório`;

      this.printMessage(input, errorMessage);
    }

  }

  // Validação do campo de senha
  passwordvalidate(input) {

    // Explodir string em array
    let charArr = input.value.split("");

    let uppercases = 0;
    let numbers = 0;

    for(let i = 0; charArr.length > i; i++) {
      if(charArr[i] === charArr[i].toUpperCase() && isNaN(parseInt(charArr[i]))) {
        uppercases++;
      } else if(!isNaN(parseInt(charArr[i]))) {
        numbers++;
      }
    }

    if(uppercases === 0 || numbers === 0) {
      let errorMessage = `A senha precisa ter, pelo menos, uma letra maiúscula e um número`;

      this.printMessage(input, errorMessage);
    }

  }

  // Método para imprimir mensagens de erro na tela
  printMessage(input, msg) {
  
    // Verificação de erros presentes no input
    let errorsQty = input.parentNode.querySelector('.error-validation');

    // Impressão de erro apenas caso não haja erros
    if(errorsQty === null) {
      let template = document.querySelector('.error-validation').cloneNode(true);

      template.textContent = msg;
  
      let inputParent = input.parentNode;
  
      template.classList.remove('template');
  
      inputParent.appendChild(template);
    }

  }

  // Remoção de todas as validações para fazer a verificação novamente
  cleanValidations(validations) {
    validations.forEach(el => el.remove());
  }

}

let form = document.getElementById('register-form');
let submit = document.getElementById('btn-submit');

let validator = new Validator();

// Evento de envio do form, validando os inputs
submit.addEventListener('click', function(e) {
  e.preventDefault();

  validator.validate(form);
});
