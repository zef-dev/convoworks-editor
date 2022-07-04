/* @ngInject */
export default function ProcessRegistrarService($log)
{
    this.registerProcess = registerProcess;
    this.removeProcess = removeProcess;
    this.isProcessActive = isProcessActive;
    this.hasActiveProcesses = hasActiveProcesses;

    this.clearAll = clearAll;

    let _processes = {};

    function registerProcess(processName)
    {
        _processes[processName] = true;
    }

    function removeProcess(processName)
    {
        _processes[processName] = false;
    }

    function isProcessActive(processName)
    {
        return _processes.hasOwnProperty(processName) && _processes[processName];
    }

    function hasActiveProcesses()
    {
        for (const process in _processes) {
            if (_processes[process] === true) {
                return true;
            }
        }

        return false;
    }

    function clearAll()
    {
        _processes = {};
    }
}