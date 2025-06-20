import axios from "api/axios";
import { axiosPrivate } from "api/axios";
import propTypes from 'prop-types'
import moment from "moment-timezone";


export const dataService = async (method, url, data, params={}) => {
    switch (method) {
        case 'GET':
            return await axios.get(url, data, params)

        case 'POST':
            return await axios.post(url, data, params)
        
        case 'PATCH':
            return await axios.patch(url, data, params)

        case 'PUT':
            return await axios.put(url, data, params)    
    }
}

export const dataServicePrivate = async (method, url, data, params={}) => {
    switch (method) {
        case 'GET':
            return await axiosPrivate.get(url, data, params)

        case 'POST':
            return await axiosPrivate.post(url, data, params)

        case 'PATCH':
            return await axiosPrivate.patch(url, data, params)
        
        case 'PUT':
            return await axiosPrivate.put(url, data, params)
    }
}

export const formatDateTime = (date, output, timezone, is_tz) => {
    return is_tz ? moment().tz( date, timezone ).format( output ) : moment( date ).format( output );
}

export const isNumber = (str) => {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}

formatDateTime.defaultProps = {
    date: '',
    output: 'YYYY-MM-DD HH:mm:ss',
    timezone: 'Asia/Manila',
    is_tz: true
}

dataService.propTypes = {
    method: propTypes.string.isRequired,
    url: propTypes.string.isRequired,
    data: propTypes.object.isRequired,
}

dataServicePrivate.propTypes = {
    method: propTypes.string.isRequired,
    url: propTypes.string.isRequired,
    data: propTypes.object.isRequired,
}

formatDateTime.propTypes = {
    date: propTypes.string.isRequired,
    output: propTypes.string,
    timezone: propTypes.string,
    is_tz: propTypes.bool,
}

isNumber.propTypes = {
    str: propTypes.string.isRequired,
}