package es.udc.fi.dc.fd.model.entities;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UsersTest {

    @Test
    void testGetBmiNullWhenMissing() {
        Users u = new Users();
        assertNull(u.getBmi());

        u.setHeightCm(180.0);
        assertNull(u.getBmi());

        u.setHeightCm(null);
        u.setWeightKg(80.0);
        assertNull(u.getBmi());
    }

    @Test
    void testGetBmiAndCategory() {
        Users u = new Users();
        u.setHeightCm(180.0);
        u.setWeightKg(81.0);
        Double bmi = u.getBmi();
        assertNotNull(bmi);
        assertTrue(bmi >= 25.0);
        assertEquals("OVERWEIGHT", u.getBmiCategory());

        u.setWeightKg(70.0);
        assertEquals("NORMAL", u.getBmiCategory());

        u.setWeightKg(55.0);
        assertEquals("UNDERWEIGHT", u.getBmiCategory());

        u.setWeightKg(120.0);
        assertEquals("OBESITY", u.getBmiCategory());
    }

    @Test
    void testFollowAndUnfollow() {
        Users a = new Users("a","p","A","A","a@x.com","f");
        Users b = new Users("b","p","B","B","b@x.com","f");

        // initially empty
        assertTrue(a.getFollowing().isEmpty());
        assertTrue(b.getFollowers().isEmpty());

        a.follow(b);
        assertTrue(a.getFollowing().contains(b));
        assertTrue(b.getFollowers().contains(a));
        assertEquals(1L, a.getFollowingCount());
        assertEquals(1L, b.getFollowersCount());

        // following again doesn't change
        a.follow(b);
        assertEquals(1L, a.getFollowingCount());

        // unfollow
        a.unfollow(b);
        assertFalse(a.getFollowing().contains(b));
        assertFalse(b.getFollowers().contains(a));
        assertEquals(0L, a.getFollowingCount());
        assertEquals(0L, b.getFollowersCount());
    }

    @Test
    void testAddRemoveSavedRoutine() {
        Users u = new Users("u","p","U","U","u@x.com","f");
        Routine r = new Routine("r","lvl","d","mat",u,null,true);

        assertTrue(u.getSavedRoutines().isEmpty());
        u.addSavedRoutine(r);
        assertTrue(u.getSavedRoutines().contains(r));
        assertTrue(r.getSavedByUsers().contains(u));

        u.removeSavedRoutine(r);
        assertFalse(u.getSavedRoutines().contains(r));
        assertFalse(r.getSavedByUsers().contains(u));
    }
}
