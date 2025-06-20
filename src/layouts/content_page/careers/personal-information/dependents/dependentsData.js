import moment from 'moment';
import * as yup from 'yup';


export default [
    {
        id: 'name',
        label: 'Name',
        type: 'text',
        required: true,
    },
    {
        id: 'birthday',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        options: { 
            shouldDisableYear: ((date) => (moment(date).year() > moment().year())),
            views: ['month', 'day', 'year'],
            openTo: 'month',
        },
    },
    {
        id: 'relationship',
        label: 'Relationship',
        type: 'text',
        required: true,
    },
]