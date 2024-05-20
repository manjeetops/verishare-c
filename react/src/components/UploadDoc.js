import React from 'react';
import DialogBox from './Dialog/DialogBox';
import Step1 from './Uploader/Steps/step1';

class UploadDoc extends React.PureComponent {
  state = {
    document: null,
  };

  render() {  
    return (
      <DialogBox {...this.props}>
        <Step1 callback={this.props.onSubmit} />
      </DialogBox>
    );
  }
}

export default UploadDoc;
