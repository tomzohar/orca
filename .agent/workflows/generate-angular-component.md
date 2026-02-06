---
description: use when generating a new angular component or refactoring an existing component
---

# each component should have:
 - typescript file with the component class
 - html file for the template
 - scss file for the styles
 - spec file for unit testing

## code quality
 - if a component exceeds ~500 lines - split it 
 - components should only handle view logic - no business logic, api calls or calculations that are not specifically required for the template
 - use services extensively do bundle logical units of code
 - use @inject function DO NOT inject service in the constructor

## inputs & outputs
 - use signals
 - DONT USE @Input / @Output
 - prefer a single input config type vs multiple inputs

## class methods
 - strict types for arguments and return type
 - single responsibility

## templates
 - ALWAYS use ui components from the design-system
 - if a component is missing from the design system and is required - implement it using the /storybook workflow
 - avoid using native html elements outside design-system lib
 - NO *ngIf and *ngFor - use @if / @for / @switch

## scss styles 
 - ALWAYS use design tokens and common styles from design system
 - avoid ::ng-deep
 - avoid unnecessary nesting and complex selectors
 - if a design token or shared style is missing - add it to the design system