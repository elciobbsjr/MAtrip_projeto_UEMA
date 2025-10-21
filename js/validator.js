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
    ];
  }

  // Validação de todos os campos
  validate(form) {
    // limpa validações antigas
    const currentValidations = document.querySelectorAll('form .error-validation');
    if (currentValidations.length) this.cleanValidations(currentValidations);

    // pega todos os inputs do form
    const inputs = [...form.getElementsByTagName('input')];

    inputs.forEach((input) => {
      for (let i = 0; i < this.validations.length; i++) {
        if (input.hasAttribute(this.validations[i])) {
          const method = this.validations[i].replace('data-', '').replace('-', '');
          const value = input.getAttribute(this.validations[i]);
          this[method](input, value);
        }
      }
    });
  }

  minlength(input, minValue) {
    if (input.value.length < minValue) {
      this.printMessage(input, `O campo precisa ter, no mínimo, ${minValue} caracteres`);
    }
  }

  maxlength(input, maxValue) {
    if (input.value.length > maxValue) {
      this.printMessage(input, `O campo precisa ter, no máximo, ${maxValue} caracteres`);
    }
  }

  onlyletters(input) {
    const re = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!re.test(input.value)) {
      this.printMessage(input, `Este campo não aceita números nem caracteres especiais`);
    }
  }

  emailvalidate(input) {
    const re = /\S+@\S+\.\S+/;
    if (!re.test(input.value)) {
      this.printMessage(input, `Insira um e-mail válido (ex.: joao@gmail.com)`);
    }
  }

  equal(input, inputName) {
    const compare = document.getElementsByName(inputName)[0];
    if (input.value !== compare.value) {
      this.printMessage(input, `Este campo precisa ser igual ao ${inputName}`);
    }
  }

  required(input) {
    if (input.value.trim() === '') {
      this.printMessage(input, `Este campo é obrigatório`);
    }
  }

  passwordvalidate(input) {
    const upper = /[A-Z]/;
    const number = /[0-9]/;
    if (!upper.test(input.value) || !number.test(input.value)) {
      this.printMessage(input, `A senha precisa ter pelo menos uma letra maiúscula e um número`);
    }
  }

  // Exibe a mensagem de erro
  printMessage(input, msg) {
    const existingError = input.parentNode.querySelector('.error-validation');
    if (!existingError) {
      const template = document.createElement('div');
      template.classList.add('error-validation');
      template.textContent = msg;
      input.parentNode.appendChild(template);
    }
  }

  cleanValidations(validations) {
    validations.forEach((el) => el.remove());
  }
}

// Inicializa o validador
const form = document.getElementById('cadastroForm');
if (form) {
  const validator = new Validator();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validator.validate(form);
  });
}
