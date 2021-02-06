import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent, merge, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})

export class FormComponent implements AfterViewInit {
  constructor(private form: ElementRef) { }

  disabled: Boolean = true
  inputsArray = [{
    label: 'E-mail',
    type: 'email',
    name: 'email',
    id: 'input-mail',
    pattern: '.{4,}',
    required: true,
    errorText: 'wrong mail format'
  },
  {
    label: 'Password',
    type: 'password',
    name: 'pass',
    id: 'input-pass',
    pattern: '.{4,}',
    required: true,
    errorText: 'too short password'
  },
  {
    label: 'Repeat Password',
    type: 'password',
    name: 'repeat-pass',
    id: 'input-pass-repeat',
    pattern: '.{4,}',
    required: false,
    errorText: 'passwords do not match'
  }]

  ngAfterViewInit(): void {
    const inputMail = this.form.nativeElement.querySelector('#input-mail');
    const inputPass = this.form.nativeElement.querySelector('#input-pass');
    const inputPassRepeat = this.form.nativeElement.querySelector('#input-pass-repeat')
    const buttonRegister = this.form.nativeElement.querySelector('#register')

    const inputMail$ = fromEvent<any>(inputMail, 'keyup')
    const inputPass$ = fromEvent<any>(inputPass, 'keyup')
    const inputPassRepeat$ = fromEvent<any>(inputPassRepeat, 'keyup')
    const buttonRegister$ = fromEvent<any>(buttonRegister, 'click')

    const ErrorMessages$ = merge(inputMail$, inputPass$, inputPassRepeat$).pipe(
      map( // select inputs
        event => event.target
      ),
      map( // filtered validity from inputs
        input => ({ input, validity: input.validity })
      )
    );

    const submitValidation$ = combineLatest([inputMail$, inputPass$, inputPassRepeat$]).pipe(
      map(  // select inputs
        ([emailEvent, passEvent, passRepeatEvent]) =>
          [emailEvent.target, passEvent.target, passRepeatEvent.target]
      ),
      map( // check validate
        ([emailInput, passInput, passRepeatInput]) => {
          passRepeatInput.pattern = passInput.value; // password repeat check
          return emailInput.validity.valid && passInput.validity.valid && passRepeatInput.validity.valid
        }
      )
    );

    // display errors
    ErrorMessages$.subscribe(({ input, validity }) => {
      const error = input.nextElementSibling;
      validity.valid ? error.classList.add('hide') : error.classList.remove('hide')
    });

    // disabled button
    submitValidation$.subscribe(formValid => {
      this.disabled = !formValid;
    });

    // send the results
    buttonRegister$.subscribe(() => {
      alert(
        JSON.stringify({
          email: inputMail.value,
          password: inputPass.value
        })
      )
    });
  }
}
