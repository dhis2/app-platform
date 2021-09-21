import React from 'react';
import Heading from 'd2-ui/lib/headings/Heading.component';

export default function AccessDenied() {
    return (
        <div>
            <Heading>Access denied!</Heading>
            <p>
                Unfortunately you do not have access to this functionality.
            </p>
        </div>
    );
}
