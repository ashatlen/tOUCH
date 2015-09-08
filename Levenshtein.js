function LevenshteinDistance(s, t)
    {
        // degenerate cases
        if (s == t) return 0;
        if (s.length == 0) return t.length;
        if (t.length == 0) return s.length;

        // create two work vectors of integer distances
        var v0 = new Array(t.length + 1);
        var v1 = new Array(t.length + 1);

        // initialize v0 (the previous row of distances)
        // this row is A[0][i]: edit distance for an empty s
        // the distance is just the number of characters to delete from t
        for (var j = 0; j < v0.length; j++)
        v0[j] = j;

        for (var i = 0; i < s.length; i++)
        {
        // calculate v1 (current row distances) from the previous row v0

        // first element of v1 is A[i+1][0]
        //   edit distance is delete (i+1) chars from s to match empty t
        v1[0] = i + 1;

        // use formula to fill in the rest of the row
        for (var k = 0; k < t.length; k++)
        {
        var cost = (s[i] == t[k]) ? 0 : 1;
        v1[k + 1] = Math.min(v1[k] + 1, v0[k + 1] + 1, v0[k] + cost);
        }

        // copy v1 (current row) to v0 (previous row) for next iteration
        for (var l = 0; l < v0.length; l++)
        v0[l] = v1[l];
        }

        return v1[t.length];
        }
