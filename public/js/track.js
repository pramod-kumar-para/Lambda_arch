/**
 * Created by pramod on 2/26/16.
 */

(function()
{
    var custom_data = {
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        screen_size: window.innerWidth + ' X ' + window.innerHeight,
        browser_version: get_browser_info().version,
        agent: get_browser_info().name,
        browser: navigator.appName,
        page_url: location.href,
        page_name:document.title,
        //domain_name:location.hostname,
        domain_name:'google',
        event_name:'page_views'
    }

    var socket = io.connect('http://localhost:9090')
    socket.emit('custom_data', custom_data);
})();

    function get_browser_info() {
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return {name: 'IE', version: (tem[1] || '')};
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/)
            if (tem != null) {
                return {name: 'Opera', version: tem[1]};
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) {
            M.splice(1, 1, tem[1]);
        }
        return {
            name: M[0],
            version: M[1]
        };
    }

