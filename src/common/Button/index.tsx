import React from 'react';

const Button = (props: any) => {
  const {
    className = '',
    transparent = false,
    layoutTheme = 'light',
    gradient = false,
    children = <></>,
    big = false,
    to = '',
    crumpled = false,
    gray = false,
    iconed = false,
    disabled = false,
    onClick = () => {
    }
  } = props;
  const classNames = `${className} button
        ${big ? 'button--big' : ''}
        ${crumpled ? 'button--crumpled' : ''}
        ${transparent ? 'button--transparent' : ''}
        ${gray ? 'button--gray' : ''}
        ${iconed ? 'button--iconed' : ''}
        ${gradient ? `button--gradient` : `button--${layoutTheme}`}
        ${disabled ? 'button--disabled' : ''}`;

  return <>
    {to.length ?
      <a href={to} target='_blank' rel='noopener noreferrer' className={classNames}>
        {children}
      </a> :
      <button className={classNames} onClick={onClick} disabled={disabled}>
        {children}
      </button>}
  </>;
};
export default Button;
