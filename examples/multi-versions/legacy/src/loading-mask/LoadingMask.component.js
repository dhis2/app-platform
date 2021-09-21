import React from 'react';
import CircularProgress from 'd2-ui/lib/circular-progress/CircularProgress';

export default class LoadingMask extends React.Component {
  render() {
    const loadingStatusMask = {
      left: '45%',
      position: 'fixed',
      top: '45%',
    };

    return (
      <div style={loadingStatusMask}>
        <CircularProgress />
      </div>
    );
  }
};
