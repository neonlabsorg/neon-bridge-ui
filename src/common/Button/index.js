import React from "react"

const Button = ({className = '',
transparent = false,
layoutTheme = 'dark',
gradient = false,
children = null,
big = false, to = '',
crumpled = false,
disabled = false,
onClick = () => {}}) => {
    const classNames = `${className} button
        ${big ? 'button--big' : ''}
        ${crumpled ? 'button--crumpled' : ''}
        ${transparent ? 'button--transparent' : ''}
        ${gradient ? `button--gradient`: `button--${layoutTheme}`}
        ${disabled ? 'button--disabled' : ''}`
    return <React.Fragment>
        {to.length ? <a href={to} target='_blank'
            rel='noopener noreferrer'
            className={classNames}>
                {children}
            </a> : <div className={classNames} onClick={onClick}>{children}</div>}
    </React.Fragment>
}
export default Button
