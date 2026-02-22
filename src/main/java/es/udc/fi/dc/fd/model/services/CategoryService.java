package es.udc.fi.dc.fd.model.services;

import java.util.List;

import es.udc.fi.dc.fd.model.entities.Category;

public interface CategoryService {

    /**
     * Devuelve todas las categorías existentes.
     *
     * @return lista de categorías
     */
    List<Category> findAll();

}
