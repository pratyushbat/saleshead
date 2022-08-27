import { style, animate, trigger, transition, query, stagger } from '@angular/animations';

export const pageAnimations = trigger('pageAnimations', [
  transition(':enter', [
    query('.contact-add-search-module, form', [
      style({ opacity: 0, transform: 'translateX(-50px)' }),
      stagger(-30, [
        animate('1000ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))
      ])
    ], { optional: true })
  ])
])
export const filterAnimation =  trigger('filterAnimation', [
  transition(':enter, * => 0, * => -1', []),
  transition(':increment', [
    query(':enter', [
      style({ opacity: 0, width: '0px' }),
      stagger(50, [
        animate('500ms ease-out', style({ opacity: 1, width: '*' })),
      ]),
    ], { optional: true })
  ]),
  transition(':decrement', [
    query(':leave', [
      stagger(50, [
        animate('500ms ease-out', style({ opacity: 0, width: '0px' })),
      ]),
    ])
  ]),
])
