import React from 'react';

const SaveButton = (props) => (
    <form
        onSubmit={props.onSubmit}
        style={{ display: 'flex' }}>
        <input
            type="submit"
            value="Save IP address"
            className="btn"
            style={{ flex: '1' }}

        />
    </form>
);

export default SaveButton;