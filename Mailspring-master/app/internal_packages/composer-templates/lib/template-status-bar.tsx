import React from 'react';
import { localized, PropTypes, Message, MessageWithEditorState } from 'mailspring-exports';

class TemplateStatusBar extends React.Component<{ draft: MessageWithEditorState }> {
  static displayName = 'TemplateStatusBar';

  static containerStyles = {
    textAlign: 'center',
    width: 580,
    margin: 'auto',
  };

  static propTypes = {
    draft: PropTypes.object.isRequired,
  };

  _usingTemplate(draft: MessageWithEditorState) {
    return (
      draft &&
      draft.bodyEditorState &&
      draft.bodyEditorState.document.getInlinesByType('templatevar').size > 0
    );
  }

  render() {
    if (!this._usingTemplate(this.props.draft)) {
      return <div />;
    }
    return (
      <div className="template-status-bar">
        {localized(
          'Press "tab" to quickly move between the blanks - highlighting will not be visible to recipients.'
        )}
      </div>
    );
  }
}

export default TemplateStatusBar;
