const StatusMessages = (status) => {
    switch (status.toLowerCase()) {
        case 'ganando':
            return 'project.bid.status.winning';
        case 'ganado':
            return 'project.bid.status.won';
        case 'perdedora':
            return 'project.bid.status.lost';
        default:
            return 'project.bid.status.unknown';
    }
};

export default StatusMessages;

