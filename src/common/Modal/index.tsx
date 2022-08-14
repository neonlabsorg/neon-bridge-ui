import React from 'react'

import Button from '@/common/Button'
import { ReactComponent as CloseIcon } from '@/assets/cross.svg'

export class Modal extends React.Component<any, any> {
  overlay
  rootRef

  constructor(props) {
    super(props)
    this.overlay = document.querySelector('.modals-overlay')
    this.rootRef = React.createRef()
  }

  closeModal() {
    if (this.overlay) {
      this.overlay.remove()
    }
    this.props.onDestroy()
  }

  render() {
    const {
      className,
      bodyClassName,
      headerClassName,
      children,
      panel,
      e2eActionClose,
      e2eSelectorTitle,
      titleClassName,
    } = this.props
    let actions = []
    if (panel) {
      if (Array.isArray(panel.props.children)) actions = panel.props.children
      else actions.push(panel.props.children)
    }
    const renderBtnPanel = () => {
      if (panel) {
        return (
          <div className={'modal__btn-panel'}>
            {actions.map((child, index) => (
              <Button className={'modal__btn'} key={index} {...child.props} />
            ))}
          </div>
        )
      }
    }
    const renderCloseIcon = () => {
      if (this.props.onDestroy) {
        return (
          <div
            className={'modal__close'}
            data-e2e-action={e2eActionClose}
            onClick={this.closeModal.bind(this)}
          >
            <CloseIcon />
          </div>
        )
      }
    }
    const renderChild = () => {
      return React.cloneElement(children as any, { onClose: this.closeModal.bind(this) })
    }

    return (
      <div className={`modal ${className ? className : ''}`} ref={this.rootRef}>
        <div className={`modal__header ${headerClassName ? headerClassName : ''}`}>
          <div
            className={`modal__title ${titleClassName ? titleClassName : ''}`}
            data-e2e-selector={e2eSelectorTitle}
          >
            {this.props.title}
          </div>
          {renderCloseIcon()}
        </div>
        <div className={`modal__body ${bodyClassName ? bodyClassName : ''}`}>{renderChild()}</div>
        {renderBtnPanel()}
      </div>
    )
  }
}
