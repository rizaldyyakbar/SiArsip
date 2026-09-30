package db

import (
	"context"

	"github.com/jackc/pgx/v5"
)

func Connect(ctx context.Context, databaseURL string) (*pgx.Conn, error) {
	connection, err := pgx.Connect(ctx, databaseURL)
	if err != nil {
		return nil, err
	}

	if err := connection.Ping(ctx); err != nil {
		_ = connection.Close(ctx)
		return nil, err
	}

	return connection, nil
}
