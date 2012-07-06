////////////////////////////////////////////////////////////////////
///
///   MorkParser.cpp - Mozilla Mork Format Parser/Reader 
///
///   Copyright (C) 2007 ScalingWeb.com
///   All rights reserved. 
/// 
///   Authors: Yuriy Soroka <ysoroka@scalingweb.com>
///////////////////////////////////////////////////////////////////



#include "MorkParser.h"
#include <stdlib.h>
#include <sstream>
#include <string>
#include <stdexcept>
#include <fstream>
#include <iostream>

std::string g_Empty = "";

inline std::string stringify(double x)
{
  std::ostringstream o;
  o << x;
  return o.str();
} 

//	=============================================================
//	MorkParser::MorkParser

MorkParser::MorkParser( int DefaultScope )
{
	initVars();
	defaultScope_ = DefaultScope;
}

//	=============================================================
//	MorkParser::open

bool MorkParser::open( const string &path )
{
	initVars();
	std::string line;
	std::ifstream infile(path.c_str(), std::ios_base::in);
	if(!infile.is_open())
	{
		error_ = FailedToOpen;
		return false;
	}

	while (getline(infile, line, '\n'))
	{
		morkData_.append(line);
		morkData_.append("\n");
	}

/*  
	// Check magic header
	QByteArray MagicHeader = MorkFile.readLine();

	if ( !MagicHeader.contains( MorkMagicHeader ) )
	{
		error_ = UnsupportedVersion;
		return false;
	}
*/

	// Parse mork
	return parse();
}

//	=============================================================
//	MorkParser::error

inline MorkErrors MorkParser::error()
{
	return error_;
}

//	=============================================================
//	MorkParser::initVars

void MorkParser::initVars()
{
	error_ = NoError;
	morkPos_ = 0;
	nowParsing_ = NPValues;
	currentCells_ = 0;
	nextAddValueId_ = 0x7fffffff;  
}

//	=============================================================
//	MorkParser::parse

bool MorkParser::parse()
{
	bool Result = true;
	char cur = 0;

	// Run over mork chars and parse each term
	cur = nextChar();

	int i = 0;

	while ( Result && cur )
	{
		if ( !isWhiteSpace( cur ) )
		{
			i++;
			// Figure out what a term
			switch ( cur )
			{
			case '<':
				// Dict
				Result = parseDict();
				break;
			case '/':
				// Comment
				Result = parseComment();
				break;
			case '{':
				Result = parseTable();
				// Table
				break;
			case '[':
				Result = parseRow( 0, 0 );
				// Row
				break;
			case '@':
				Result = parseGroup();
				// Group
				break;
			default:
				error_ = DefectedFormat;
				Result = false;
				break;
			}
		}

		// Get next char
		cur = nextChar();
	}

	return Result;
}

//	=============================================================
//	MorkParser::isWhiteSpace

bool MorkParser::isWhiteSpace( char c )
{
	switch ( c )
	{
	case ' ':
	case '\t':
	case '\r':
	case '\n':
	case '\f':
		return true;
	default:
		return false;
	}
}

//	=============================================================
//	MorkParser::nextChar

inline char MorkParser::nextChar()
{
	char cur = 0;

	
	if ( (uint)morkPos_ < morkData_.length() )
	{
		cur = morkData_[ morkPos_ ];
		morkPos_++;
	}

	if ( !cur )
	{
		cur = 0;
	}

	return cur;
}

//	=============================================================
//	MorkParser::parseDict

bool MorkParser::parseDict()
{
	char cur = nextChar();
	bool Result = true;
	nowParsing_ = NPValues;

	while ( Result && cur != '>' && cur )
	{
		if ( !isWhiteSpace( cur ) )
		{
			switch ( cur )
			{
			case '<':
      {

			if ( morkData_.substr( morkPos_ - 1, strlen( MorkDictColumnMeta ) ) == MorkDictColumnMeta )
			{
				nowParsing_ = NPColumns;
				morkPos_ += strlen( MorkDictColumnMeta ) - 1;
			}
		
        
        break;
      }
			case '(':
				Result = parseCell();
				break;
			case '/':
				Result = parseComment();
				break;

			}
		}

		cur = nextChar();
	}

	return Result;
}

//	=============================================================
//	MorkParser::parseComment

inline bool MorkParser::parseComment()
{
	char cur = nextChar();
	if ( '/' != cur ) return false;

	while ( cur != '\r' && cur != '\n' && cur )
	{
		cur = nextChar();
	}

	return true;
}

//	=============================================================
//	MorkParser::parseCell

bool MorkParser::parseCell()
{
	bool Result = true;
	bool bValueOid = false;
	bool bColumn = true;
	int Corners = 0;

	// Column = Value
	std::string Column;
	std::string Text;
	Column.reserve( 4 );
	Text.reserve( 32 );

	char cur = nextChar();

	// Process cell start with column (bColumn == true)
	while ( Result && cur != ')' && cur )
	{
		switch ( cur )
		{
		case '^':
			// Oids
			Corners++;
			if ( 2 == Corners )
			{
				bColumn = false;
				bValueOid = true;
			}
			else if ( 1 != Corners)
			{
				Text += cur;
			}

			break;
		case '=':
			// From column to value
			if ( bColumn )
			{
				bColumn = false;
			}
			else
			{
				Text += cur;
			}
			break;
		case '\\':
			{
				// Get next two chars
				char NextChar= nextChar();
				if ( '\r' != NextChar && '\n' != NextChar )
				{
					Text += NextChar;
				}
				else nextChar();
			}
			break;
		case '$':
			{
				// Get next two chars
				std::string HexChar;
				HexChar += nextChar();
				HexChar += nextChar();

        int x = strtoul(HexChar.c_str(), 0, 16);
        Text += stringify(x);
				//Text += ( char ) string( HexChar.c_str() ).toInt( 0, 16 );
			}
			break;
		default:
			// Just a char
			if ( bColumn )
			{
				Column += cur;
			}
			else
			{
				Text += cur;
			}
			break;
		}

		cur = nextChar();
	}

	// Apply column and text
	//int ColumnId = string( Column.c_str() ).toInt( 0, 16 );
	int ColumnId = strtoul(Column.c_str(), 0, 16);

	if ( NPRows != nowParsing_ )
	{
		// Dicts
		if ( "" != Text )
		{
			if ( nowParsing_ == NPColumns )
			{
				columns_[ ColumnId ] = Text;
			}
			else
			{
				values_[ ColumnId ] = Text;
			}
		}
	}
	else
	{
		if ( "" != Text )
		{
			// Rows
			//int ValueId = string( Text.c_str() ).toInt( 0, 16 );
			int ValueId = strtoul(Text.c_str(), 0, 16);

			if ( bValueOid  )
			{
				( *currentCells_ )[ ColumnId ] = ValueId;
			}
			else
			{
				nextAddValueId_--;
				values_[ nextAddValueId_ ] = Text;
				( *currentCells_ )[ ColumnId ] = nextAddValueId_;
			}
		}
	}

	return Result;
}

//	=============================================================
//	MorkParser::parseTable

bool MorkParser::parseTable()
{
	bool Result = true;
	std::string TextId;
	int Id = 0, Scope = 0;

	char cur = nextChar();

	// Get id
	while ( cur != '{' && cur != '[' && cur != '}' && cur )
	{
		if ( !isWhiteSpace( cur ) )
		{
			TextId += cur;
		}

		cur = nextChar();
	}

	parseScopeId( TextId, &Id, &Scope );

	// Parse the table
	while ( Result && cur != '}' && cur )
	{
		if ( !isWhiteSpace( cur ) )
		{
			switch ( cur )
			{
			case '{':
				Result = parseMeta( '}' );
				break;
			case '[':
				Result = parseRow( Id, Scope );
				break;
			case '-':
			case '+':
				break;
			default:
				{
					std::string JustId;
					while ( !isWhiteSpace( cur ) && cur )
					{
						JustId += cur;
						cur = nextChar();

						if ( cur == '}' )
						{
							return Result;
						}
					}

					int JustIdNum = 0, JustScopeNum = 0;
					parseScopeId( JustId, &JustIdNum, &JustScopeNum );

					setCurrentRow( Scope, Id, JustScopeNum, JustIdNum );
				}
				break;
			}
		}

		cur = nextChar();
	}

	return Result;
}

//	=============================================================
//	MorkParser::parseScopeId

void MorkParser::parseScopeId( const std::string &TextId, int *Id, int *Scope )
{
	int Pos = 0;

	if ( ( Pos = TextId.find( ':' ) ) >= 0 )
	{
		std::string tId = TextId.substr( 0, Pos );
		std::string tSc = TextId.substr( Pos + 1, TextId.length() - Pos );

		if ( tSc.length() > 1 && '^' == tSc[ 0 ] )
		{
			// Delete '^'
			tSc.erase( 0, 1 );
		}

		//*Id = string( tId.c_str() ).toInt( 0, 16 );
    *Id = strtoul(tId.c_str(), 0, 16);

		//*Scope = string( tSc.c_str() ).toInt( 0, 16 );
    *Scope = strtoul(tSc.c_str(), 0, 16);
	}
	else
	{
		//*Id = string( TextId.c_str() ).toInt( 0, 16 );
		//*Id = string( TextId.c_str() ).toInt( 0, 16 );
    *Id = strtoul(TextId.c_str(), 0, 16);
	}
}

//	=============================================================
//	MorkParser::setCurrentRow

inline void MorkParser::setCurrentRow( int TableScope, int TableId, int RowScope, int RowId )
{
	if ( !RowScope )
	{
		RowScope = defaultScope_;
	}

	if ( !TableScope )
	{
		TableScope = defaultScope_;
	}

	currentCells_ = &( mork_[ abs( TableScope ) ][ abs( TableId ) ][ abs( RowScope ) ][ abs( RowId ) ] );
}

//	=============================================================
//	MorkParser::parseRow

bool MorkParser::parseRow( int TableId, int TableScope )
{
	bool Result = true;
	std::string TextId;
	int Id = 0, Scope = 0;
	nowParsing_ = NPRows;

	char cur = nextChar();

	// Get id
	while ( cur != '(' && cur != ']' && cur != '[' && cur )
	{
		if ( !isWhiteSpace( cur ) )
		{
			TextId += cur;
		}

		cur = nextChar();
	}

	parseScopeId( TextId, &Id, &Scope );
	setCurrentRow( TableScope, TableId, Scope, Id );

	// Parse the row
	while ( Result && cur != ']' && cur )
	{
		if ( !isWhiteSpace( cur ) )
		{
			switch ( cur )
			{
			case '(':
				Result = parseCell();
				break;
			case '[':
				Result = parseMeta( ']' );
				break;
			default:
				Result = false;
				break;
			}
		}

		cur = nextChar();
	}

	return Result;
}

//	=============================================================
//	MorkParser::parseGroup

bool MorkParser::parseGroup()
{
	return parseMeta( '@' );
}

//	=============================================================
//	MorkParser::parseMeta

bool MorkParser::parseMeta( char c )
{
	char cur = nextChar();

	while ( cur != c && cur )
	{
		cur = nextChar();
	}

	return true;
}

//	=============================================================
//	MorkParser::getTables

MorkTableMap *MorkParser::getTables( int TableScope )
{
	TableScopeMap::iterator iter;
	iter = mork_.find( TableScope );

	if ( iter == mork_.end() )
	{
		return 0;
	}

	//return &iter.value();
  return &iter->second;
}

//	=============================================================
//	MorkParser::getRows

MorkRowMap *MorkParser::getRows( int RowScope, RowScopeMap *table )
{
	RowScopeMap::iterator iter;
	iter = table->find( RowScope );

	if ( iter == table->end() )
	{
		return 0;
	}

	//return &iter.value();
  return &iter->second;
}

//	=============================================================
//	MorkParser::getValue

std::string &MorkParser::getValue( int oid )
{
	MorkDict::iterator foundIter = values_.find( oid );

	if ( values_.end() == foundIter )
	{
		return g_Empty;
	}

	//return *foundIter;
  return foundIter->second;
}

//	=============================================================
//	MorkParser::getColumn

std::string &MorkParser::getColumn( int oid )
{
	MorkDict::iterator foundIter = columns_.find( oid );

	if ( columns_.end() == foundIter )
	{
		return g_Empty;
	}

	//return *foundIter;
  return foundIter->second;
}


#ifndef QT_NO_DEBUG

//	=============================================================
//	MorkParser::debugWrite

void MorkParser::debugWrite( const string & )//path )
{
	//QFile outfile( path );
	//outfile.open( QIODevice::WriteOnly );
	//QTextStream output( &outfile );

	//output.setCodec( "utf-8" );

	//output << "Column Dict:\r\n";
	//output << "=============================================\r\n\r\n";

	//// columns dict
	//for ( MorkDict::iterator iter = columns_.begin();
	//	iter != columns_.end(); iter++ )
	//{
	//	output	<< string::number( iter.key(), 16 ).toUpper() 
	//			<< " : " 
	//			<< iter->second.c_str() 
	//			<< "\r\n";
	//}

	//// values dict
	//output << "\r\nValues Dict:\r\n";
	//output << "=============================================\r\n\r\n";

	//for ( MorkDict::iterator iter = values_.begin();
	//	iter != values_.end(); iter++ )
	//{
	//	output	<< string::number( iter->first, 16 ).toUpper() 
	//			<< " : " 
	//			<< string::fromUtf8( iter->second.c_str() )
	//			<< "\r\n";
	//}

	//output << "\r\nData:\r\n";
	//output << "=============================================\r\n\r\n";

	//// Mork data
	//for ( TableScopeMap::iterator iter = mork_.begin();
	//	iter != mork_.end(); iter++ )
	//{
	//	output << "\r\n Scope:" << string::number( iter->first, 16 ).toUpper() << "\r\n";

	//	for ( MorkTableMap::iterator TableIter = iter->second.begin();
	//		TableIter != iter->second.end(); TableIter++ )
	//	{
	//		output	<< "\t Table:" 
	//				<< ( ( int ) TableIter->first < 0 ? "-" : " " )
	//				<< string::number( abs( TableIter->first ), 16 ).toUpper() << "\r\n";

	//		for ( RowScopeMap::iterator RowScopeIter = TableIter->second.begin();
	//			RowScopeIter != TableIter->second.end(); RowScopeIter++ )
	//		{
	//			output << "\t\t RowScope:" << string::number( RowScopeIter->first, 16 ).toUpper() << "\r\n";

	//			for ( MorkRowMap::iterator RowIter = RowScopeIter->second.begin();
	//				RowIter != RowScopeIter->second.end(); RowIter++ )
	//			{
	//				output	<< "\t\t\t Row Id:" 
	//						<< ( ( int ) RowIter->first < 0 ? "-" : " ")
	//						<< string::number( abs( RowIter->first ), 16 ).toUpper() << "\r\n";
	//				output << "\t\t\t\t Cells:\r\n";

	//				for ( MorkCells::iterator CellsIter = RowIter->second.begin();
	//					CellsIter != RowIter->second.end(); CellsIter++ )
	//				{
	//					// Write ids
	//					output	<< "\t\t\t\t\t"
	//							<< string::number( CellsIter.key(), 16 ).toUpper()
	//							<< " : "
	//							<< string::number( *CellsIter, 16 ).toUpper()
	//							<< "  =>  ";

	//					MorkDict::iterator FoundIter = values_.find( *CellsIter );

	//					if ( FoundIter != values_.end() )
	//					{
	//						// Write string values
	//						output	<< columns_[ CellsIter.key() ].c_str()
	//								<< " : "
	//								<< string::fromUtf8( FoundIter->second.c_str() )
	//								<< "\r\n";
	//					}
	//				}
	//			}
	//		}
	//	}
	//}

	//output.flush();
}

#endif // QT_NO_DEBUG


