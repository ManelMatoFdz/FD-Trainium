package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;

/**
 * Service for generating user's yearly wrapped statistics.
 */
public interface WrappedService {

    /**
     * Get wrapped statistics for a user for a specific year.
     *
     * @param userId the user's id
     * @param year the year to calculate statistics for
     * @return WrappedStats containing all yearly statistics
     * @throws InstanceNotFoundException if user is not found
     */
    WrappedStats getWrappedStats(Long userId, int year) throws InstanceNotFoundException;
}
