///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: Context. </summary>
	public partial class ContextRelations
	{
		/// <summary>CTor</summary>
		public ContextRelations()
		{
		}

		/// <summary>Gets all relations of the ContextEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();
			toReturn.Add(this.AttributeEntityUsingContextId);


			return toReturn;
		}

		#region Class Property Declarations

		/// <summary>Returns a new IEntityRelation object, between ContextEntity and AttributeEntity over the 1:n relation they have, using the relation between the fields:
		/// Context.Id - Attribute.ContextId
		/// </summary>
		public virtual IEntityRelation AttributeEntityUsingContextId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Attribute" , true);
				relation.AddEntityFieldPair(ContextFields.Id, AttributeFields.ContextId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("ContextEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", false);
				return relation;
			}
		}



		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
